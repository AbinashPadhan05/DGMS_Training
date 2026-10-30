// Who is making changes, so every change can be written to the audit log.
let actor = { role: "system", name: "System" };

export const setAuditActor = (user) => { actor = user ? { role: user.role, name: user.name, id: user.id } : { role: "system", name: "System" }; };
export const getAuditActor = () => actor;

export const MAX_AUDIT_ENTRIES = 1000;

export function makeAuditEntry(action, target = "", detail = "") {
  return {
    id: `A-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    at: new Date().toISOString(),
    by: actor.name,
    role: actor.role,
    action,
    target,
    detail,
  };
}
