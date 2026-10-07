import { Role } from '@prisma/client';

const STAFF_ROLES: Role[] = [Role.ADMIN, Role.MANAGER, Role.EDITOR];
const PRODUCT_WRITERS: Role[] = STAFF_ROLES;
const PRODUCT_DELETERS: Role[] = [Role.ADMIN, Role.MANAGER];
const ORDER_MANAGERS: Role[] = [Role.ADMIN, Role.MANAGER];

const isStaff = (role?: Role | null) => !!role && STAFF_ROLES.includes(role);

export { STAFF_ROLES, PRODUCT_WRITERS, PRODUCT_DELETERS, ORDER_MANAGERS, isStaff };
