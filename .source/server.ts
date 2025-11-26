// @ts-nocheck
import * as __fd_glob_5 from "../content/docs/setup-guide.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/service-layer.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/server-actions.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/introduction.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/implementation-plan.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/database-schema.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"database-schema.mdx": __fd_glob_0, "implementation-plan.mdx": __fd_glob_1, "introduction.mdx": __fd_glob_2, "server-actions.mdx": __fd_glob_3, "service-layer.mdx": __fd_glob_4, "setup-guide.mdx": __fd_glob_5, });