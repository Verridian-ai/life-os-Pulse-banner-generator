
import * as DrizzleLib from '@lucia-auth/adapter-drizzle';
console.log('Keys:', Object.keys(DrizzleLib));
try {
    const { DrizzleAdapter } = DrizzleLib;
    console.log('DrizzleAdapter type:', typeof DrizzleAdapter);
} catch (e) {
    console.log('Error destructuring:', e);
}
console.log('Default export:', DrizzleLib.default);
