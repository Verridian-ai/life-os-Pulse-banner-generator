import type { User, Session } from 'lucia';

export type HonoEnv = {
    Variables: {
        user: User | null;
        session: Session | null;
    };
};
