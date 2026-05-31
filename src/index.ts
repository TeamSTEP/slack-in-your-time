// entry point of the application. The actual app logic is inside the app.ts file
import main from './app';

(() => {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
})();
