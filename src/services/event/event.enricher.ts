import { EventWithRelations } from "../../types/type";
const prisma = require("../../config/db.config");

export async function enrichEvents(
  events: EventWithRelations[]
) {
  if (!events.length) return [];

  /* ---------- Collect lookup IDs ---------- */
  const hostIds: string[] = [];
  const categoryIds: string[] = [];
  const eventTypeIds: string[] = [];

  for (const ev of events) {
    if (ev.categoryIdentity) categoryIds.push(ev.categoryIdentity);
    if (ev.eventTypeIdentity) eventTypeIds.push(ev.eventTypeIdentity);

    for (const col of ev.Collaborator) {
      if (col.member.hostIdentity) {
        hostIds.push(col.member.hostIdentity);
      }
    }
  }

  /* ---------- Fetch lookups ---------- */
  const [hostCategories, eventCategories, eventTypes] = await Promise.all([
    prisma.orgCategory.findMany({
      where: { identity: { in: [...new Set(hostIds)] } },
      select: { identity: true, categoryName: true },
    }),
    prisma.AceCategoryType.findMany({
      where: { identity: { in: [...new Set(categoryIds)] } },
      select: { identity: true, categoryName: true },
    }),
    prisma.AceEventTypes.findMany({
      where: { identity: { in: [...new Set(eventTypeIds)] } },
      select: { identity: true, name: true },
    }),
  ]);

  /* ---------- Build maps ---------- */
  const hostCategoryMap: Record<string, string> = {};
  const eventCategoryMap: Record<string, string> = {};
  const eventTypeMap: Record<string, string> = {};

  for (const h of hostCategories) hostCategoryMap[h.identity] = h.categoryName;
  for (const c of eventCategories) eventCategoryMap[c.identity] = c.categoryName;
  for (const t of eventTypes) eventTypeMap[t.identity] = t.name;

  /* ---------- Enrich ---------- */
  const result: any[] = [];

  for (const ev of events) {
    // const collaborators: any[] = [];

    // for (const col of ev.Collaborator) {
    //   collaborators.push({
    //     role: col.role,
    //     member: {
    //       identity: col.member.identity,
    //       organizerName: col.member.organizerName,
    //       organizerNumber: col.member.organizerNumber,
    //       organizationName: col.member.organizationName,
    //       orgDept: col.member.orgDept,
    //       location: col.member.location,
    //       hostIdentity: col.member.hostIdentity,
    //       hostCategoryName: col.member.hostIdentity
    //         ? hostCategoryMap[col.member.hostIdentity] ?? null
    //         : null,
    //     },
    //   });
    // }

    result.push({
      ...ev,
      categoryName: ev.categoryIdentity
        ? eventCategoryMap[ev.categoryIdentity] ?? null
        : null,
      eventTypeName: ev.eventTypeIdentity
        ? eventTypeMap[ev.eventTypeIdentity] ?? null
        : null,
      // collaborators,
    });
  }

  return result;
}
