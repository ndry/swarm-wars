import { Enviornment } from "./Environment";

const env = new Enviornment();

import map from "./maps/map01";
map(env);

env.run();
