import { buildPath, resolveComponent } from "@/lib/utils";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ set: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: Props) {
  const { set } = await params;
  const route = buildPath(set);
  const sp = searchParams ? await searchParams : undefined;

  // TODO: const pageRoute = findRouteByPath(route)
  const PageView = route === "/admin" ? resolveComponent("SystemPage") : null;

  if (!PageView) {
    return notFound();
  }
  return <PageView route={route} sp={sp} />;
}
