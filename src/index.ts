/* istanbul ignore file */

import { tracer } from './lib/tracing';
import { run } from './server';

const span = tracer.startSpan('main');
tracer.withSpan(span, (): void => {
    run()
        .catch((e) => console.error(e))
        .finally(() => span.end());
});
