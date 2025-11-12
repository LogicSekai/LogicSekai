/**
 * User Management Utilities
 * Utilities for handling user soft delete, recovery, and status checking
 */

/**
 * Check if user is soft deleted
 */
export const isDeleted = (user: { deleted?: string | null } | null): boolean => {
  return !!(user?.deleted)
}

/**
 * Check if user is suspended
 */
export const isSuspended = (user: { suspended?: string | null } | null): boolean => {
  return !!(user?.suspended)
}

/**
 * Check if user can login (not suspended and not deleted)
 */
export const canLogin = (user: { suspended?: string | null; deleted?: string | null } | null): boolean => {
  if (!user) return false
  return !user.suspended && !user.deleted
}

/**
 * Get formatted deleted date
 */
export const getDeletedDate = (user: { deleted?: string | null } | null): string | null => {
  if (!user?.deleted) return null
  
  try {
    const date = new Date(user.deleted)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return user.deleted
  }
}

/**
 * Get formatted suspended date
 */
export const getSuspendedDate = (user: { suspended?: string | null } | null): string | null => {
  if (!user?.suspended) return null
  
  try {
    const date = new Date(user.suspended)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return user.suspended
  }
}

/**
 * Get user status information for UI display
 */
export const getUserStatusInfo = (user: { suspended?: string | null; deleted?: string | null } | null) => {
  if (!user) {
    return {
      status: 'unknown',
      label: 'Unknown',
      color: 'gray',
      canLogin: false,
      canRecover: false,
      isDeleted: false,
      isSuspended: false,
      deletedDate: null,
      suspendedDate: null
    }
  }

  if (user.deleted) {
    return {
      status: 'deleted',
      label: 'Deleted',
      color: 'red',
      canLogin: false,
      canRecover: true,
      isDeleted: true,
      isSuspended: false,
      deletedDate: getDeletedDate(user),
      suspendedDate: null
    }
  }

  if (user.suspended) {
    return {
      status: 'suspended',
      label: 'Suspended',
      color: 'orange',
      canLogin: false,
      canRecover: true,
      isDeleted: false,
      isSuspended: true,
      deletedDate: null,
      suspendedDate: getSuspendedDate(user)
    }
  }

  return {
    status: 'active',
    label: 'Active',
    color: 'green',
    canLogin: true,
    canRecover: false,
    isDeleted: false,
    isSuspended: false,
    deletedDate: null,
    suspendedDate: null
  }
}

/**
 * Create soft delete timestamp
 */
export const createDeleteTimestamp = (): string => {
  return new Date().toISOString()
}