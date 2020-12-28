/* istanbul ignore file */

import { EventEmitter } from 'events';
import { OpenTelemetryConfigurator } from '@myrotvorets/opentelemetry-configurator';

const configurator = new OpenTelemetryConfigurator({
    serviceName: 'psb-api-dzhura',
    tracer: {
        plugins: {
            express: {},
            http: {},
            https: {},
            knex: {
                path: '@myrotvorets/opentelemetry-plugin-knex',
            },
        },
    },
});

configurator.start().catch((e) => console.error('Failed to configure OpenTelemetry:', e));
EventEmitter.defaultMaxListeners = 12;
