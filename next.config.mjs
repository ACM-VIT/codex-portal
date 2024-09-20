export default {
  // Disable static generation for API routes
  async exportPathMap() {
    return {
      '/': { page: '/' },
      // You can exclude API routes here since they're dynamic
    };
  },
  // Ensure dynamic routes are treated correctly
  env: {
    NEXT_PHASE: process.env.NEXT_PHASE || 'runtime',
  },
};
