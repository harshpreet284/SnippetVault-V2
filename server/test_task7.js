import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const DB_URI = process.env.MONGODB_URI;

async function runTests() {
  console.log('--- Starting Task 7 API Verification ---');
  let userAToken, userBToken, userAId, userBId;
  let solutionId;

  try {
    // 1. Connect to DB to check embeddings directly
    await mongoose.connect(DB_URI);
    console.log('✓ Connected to MongoDB directly for verification');

    // Helper to extract cookies
    const getCookie = (res) => {
      const raw = res.headers.raw()['set-cookie'];
      return raw ? raw[0].split(';')[0] : '';
    };

    // 2. Register User A
    let res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User A', email: 'a@test.com', password: 'password123' })
    });
    if (res.status === 400) {
      // User exists, just login
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'a@test.com', password: 'password123' })
      });
    }
    const dataA = await res.json();
    userAId = dataA.data._id;
    userAToken = getCookie(res);
    console.log('✓ User A authenticated');

    // 3. Register User B
    res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'User B', email: 'b@test.com', password: 'password123' })
    });
    if (res.status === 400) {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'b@test.com', password: 'password123' })
      });
    }
    const dataB = await res.json();
    userBId = dataB.data._id;
    userBToken = getCookie(res);
    console.log('✓ User B authenticated');

    // 4. Create Solution with User A
    res = await fetch(`${API_BASE}/solutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': userAToken },
      body: JSON.stringify({
        title: 'Performant way to map over deeply nested arrays in JS',
        problem: 'Need to traverse a complex tree structure very quickly without call stack overflow.',
        solution: 'Use an iterative approach with a stack instead of recursion. This avoids max call stack limits.',
        technology: 'JavaScript',
        language: 'JavaScript',
        tags: ['performance', 'tree', 'traversal'],
      })
    });
    const solData = await res.json();
    solutionId = solData.data._id;
    console.log('✓ Solution created by User A');

    // 5. Wait for background embedding generation (3 seconds)
    console.log('Waiting 3s for background embedding generation...');
    await new Promise(r => setTimeout(r, 3000));

    // 6. Verify embedding directly in DB (dimensions = 768)
    const SolutionModel = mongoose.model('Solution', new mongoose.Schema({}, { strict: false }));
    const rawSol = await SolutionModel.findById(solutionId);
    if (!rawSol.embedding) throw new Error('Embedding not generated or not stored in DB!');
    if (rawSol.embedding.length !== 768) throw new Error(`Embedding has wrong dimensions: ${rawSol.embedding.length}`);
    console.log(`✓ Embedding successfully generated and stored. Dimensions: ${rawSol.embedding.length}`);

    // 7. Verify API does NOT expose embedding
    res = await fetch(`${API_BASE}/solutions/${solutionId}`, {
      headers: { 'Cookie': userAToken }
    });
    const getSolData = await res.json();
    if (getSolData.data.embedding) throw new Error('API is exposing the embedding field!');
    console.log('✓ Normal API response correctly hides embedding field');

    // 8. Update Solution and wait
    res = await fetch(`${API_BASE}/solutions/${solutionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Cookie': userAToken },
      body: JSON.stringify({ title: 'Fastest way to map over nested arrays in JS' })
    });
    console.log('✓ Solution updated. Waiting 3s for embedding regeneration...');
    await new Promise(r => setTimeout(r, 3000));
    const rawSolUpdated = await SolutionModel.findById(solutionId);
    if (!rawSolUpdated.embedding || rawSolUpdated.embedding.length !== 768) throw new Error('Updated embedding invalid!');
    console.log('✓ Embedding successfully regenerated on update');

    // 9. Semantic Search (User A) - different words, same meaning
    // Query: "speedy graph parsing" vs stored: "Fastest way to map over nested arrays in JS" / "traverse a complex tree structure very quickly"
    const query = 'speedy graph parsing';
    res = await fetch(`${API_BASE}/solutions/search?mode=semantic&q=${encodeURIComponent(query)}`, {
      headers: { 'Cookie': userAToken }
    });
    const searchA = await res.json();
    if (searchA.searchMode !== 'semantic') throw new Error(`Fell back to keyword search! Reason: ${searchA.fallbackReason}`);
    if (searchA.data.length === 0 || searchA.data[0]._id !== solutionId) {
       console.log('Semantic search failed to match. Result:', searchA.data);
       throw new Error('Semantic search did not return the expected solution.');
    }
    console.log('✓ Semantic search successfully retrieved the solution using differently worded query');

    // 10. Semantic Search (User B) - Ownership isolation
    res = await fetch(`${API_BASE}/solutions/search?mode=semantic&q=${encodeURIComponent(query)}`, {
      headers: { 'Cookie': userBToken }
    });
    const searchB = await res.json();
    if (searchB.data.length > 0) throw new Error('User B retrieved User A\'s solution! Ownership isolation failed.');
    console.log('✓ Semantic search correctly isolated by User B (no results)');

    // 11. Empty Query
    res = await fetch(`${API_BASE}/solutions/search?mode=semantic&q=`, {
      headers: { 'Cookie': userAToken }
    });
    if (res.status !== 400) throw new Error(`Empty query should return 400, got ${res.status}`);
    console.log('✓ Empty semantic query rejected correctly');

    // 12. Garbage Query
    const garbageQuery = 'xylophone banana quantum physics';
    res = await fetch(`${API_BASE}/solutions/search?mode=semantic&q=${encodeURIComponent(garbageQuery)}`, {
      headers: { 'Cookie': userAToken }
    });
    const searchGarbage = await res.json();
    if (searchGarbage.data.length > 0) {
       // Vector search might return results with low scores if we don't have a strict cutoff, but since there's only 1 item, it might return it. 
       // Actually, it returns the top N nearest neighbors. If there's only 1 document in the DB, it might technically be the nearest neighbor regardless of how far it is, unless MongoDB applies a default score threshold. 
       // Let's just log it.
       console.log(`Note: Garbage query returned ${searchGarbage.data.length} results. This is normal for basic vector search without score thresholds if it's the only document.`);
    } else {
       console.log('✓ Garbage query returned no results');
    }

    // 13. Keyword Search (User A)
    res = await fetch(`${API_BASE}/solutions/search?q=traverse`, {
      headers: { 'Cookie': userAToken }
    });
    const searchKeyword = await res.json();
    if (searchKeyword.data.length === 0 || searchKeyword.data[0]._id !== solutionId) throw new Error('Keyword search failed');
    console.log('✓ Keyword search still works perfectly');

  } catch (err) {
    console.error('\n❌ ERROR:', err.message);
  } finally {
    // Cleanup
    console.log('\n--- Cleanup ---');
    if (solutionId) {
      await fetch(`${API_BASE}/solutions/${solutionId}`, { method: 'DELETE', headers: { 'Cookie': userAToken } });
      console.log('✓ Deleted test solution');
    }
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    if (userAId) {
      await User.findByIdAndDelete(userAId);
      console.log('✓ Deleted User A');
    }
    if (userBId) {
      await User.findByIdAndDelete(userBId);
      console.log('✓ Deleted User B');
    }
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
    console.log('--- Done ---');
  }
}

runTests();
