import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  listSolutions,
  getSolution,
  createSolution,
  updateSolution,
  deleteSolution,
} from '../controllers/solutionsController.js';

const router = Router();

// All solution routes require authentication.
// protect is applied at the router level so every route below is protected.
router.use(protect);

// ── Collection routes ──────────────────────────────────────────────────────────
router.get('/', listSolutions);
router.post('/', createSolution);

// ── Phase 6 search routes go HERE — before /:id — to prevent 'search' and
// 'semantic-search' from being caught as an :id parameter.
// router.get('/search', keywordSearch);          // Phase 6
// router.post('/semantic-search', semanticSearch); // Phase 7

// ── Document routes ────────────────────────────────────────────────────────────
router.get('/:id', getSolution);
router.put('/:id', updateSolution);
router.delete('/:id', deleteSolution);

export default router;
