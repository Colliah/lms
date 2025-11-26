// @ts-nocheck
import { browser } from "fumadocs-mdx/runtime/browser";
import type * as Config from "../source.config";

const create = browser<
  typeof Config,
  import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
    DocData: {};
  }
>();
const browserCollections = {
  docs: create.doc("docs", {
    "database-schema.mdx": () =>
      import("../content/docs/database-schema.mdx?collection=docs"),
    "implementation-plan.mdx": () =>
      import("../content/docs/implementation-plan.mdx?collection=docs"),
    "introduction.mdx": () =>
      import("../content/docs/introduction.mdx?collection=docs"),
    "server-actions.mdx": () =>
      import("../content/docs/server-actions.mdx?collection=docs"),
    "service-layer.mdx": () =>
      import("../content/docs/service-layer.mdx?collection=docs"),
    "setup-guide.mdx": () =>
      import("../content/docs/setup-guide.mdx?collection=docs"),
  }),
};
export default browserCollections;
