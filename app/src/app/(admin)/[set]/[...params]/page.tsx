import { buildPath, resolveComponent } from "@/lib/utils";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ set: string; params: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ params, searchParams }: Props) {
  const { set, params: rest } = await params;
  const route = buildPath(set, rest);
  const sp = searchParams ? await searchParams : undefined;

  // TODO: const pageRoute = findRouteByPath(path)
  const PageView = route === "/admin/system-router" ? resolveComponent("SystemRouter") : null;

  if (!PageView) {
    return notFound();
  }
  return <PageView route={route} sp={sp} />;
}