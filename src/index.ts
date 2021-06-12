// entry point of the application. The actual app logic is inside the app.ts file
import main from './app';

// the entry point for the server application
(() => {
    main().catch((e) => {
        console.error(e);
        //process.exit(1);
    });
})();
