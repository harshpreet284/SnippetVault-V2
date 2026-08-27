/**
 * GET /api/health
 * Returns a simple liveness response. No auth or DB required.
 * Used to verify the server is up during development and deployment.
 */
export const getHealth = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SnippetVault API is running',
    timestamp: new Date().toISOString(),
  });
};
