import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listSolutions,
  getSolution,
  createSolution,
  updateSolution,
  deleteSolution,
  keywordSearch,
} from '../controllers/solutionsController.js';

const router = Router();

// All solution routes require authentication.
// protect is applied at the router level so every route below is protected.
router.use(protect);

// ── Collection routes ──────────────────────────────────────────────────────────
router.get('/', listSolutions);
router.post('/', createSolution);

// ── Phase 6: keyword search — registered BEFORE /:id so Express does not
// mistake the literal string "search" for a MongoDB ObjectId parameter.
router.get('/search', keywordSearch);
// router.post('/semantic-search', semanticSearch); // Phase 7

// ── Document routes ────────────────────────────────────────────────────────────
router.get('/:id', getSolution);
router.put('/:id', updateSolution);
router.delete('/:id', deleteSolution);

export default router;
