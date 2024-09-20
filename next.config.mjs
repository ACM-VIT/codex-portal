import { PHASE_PRODUCTION_BUILD } from 'next/constants';

export default (phase, { defaultConfig }) => {
  return {
    env: {
      NEXT_PHASE: phase === PHASE_PRODUCTION_BUILD ? 'build' : 'runtime',
    },
  };
};
