import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listSolutions,
  getSolution,
  createSolution,
  updateSolution,
  deleteSolution,
  keywordSearch,
  semanticSearch,
  searchController,
} from '../controllers/solutionsController.js';

const router = Router();

// All solution routes require authentication.
// protect is applied at the router level so every route below is protected.
router.use(protect);

// ── Collection routes ──────────────────────────────────────────────────────────
router.get('/', listSolutions);
router.post('/', createSolution);

// ── Phase 6 keyword search + Phase 7 semantic search ───────────────────────────
// Registered BEFORE /:id so Express never treats the literal string "search"
// as a MongoDB ObjectId parameter.
// searchController dispatches: mode=semantic → semanticSearch, else → keywordSearch
router.get('/search', searchController);

// ── Document routes ────────────────────────────────────────────────────────────
router.get('/:id', getSolution);
router.put('/:id', updateSolution);
router.delete('/:id', deleteSolution);

export default router;
