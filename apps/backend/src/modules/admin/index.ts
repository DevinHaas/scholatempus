import { Elysia, t } from 'elysia'
import { authPlugin } from '../../plugins/requireAuth.js'

export const adminModule = new Elysia({ prefix: '/admin' })
  .use(authPlugin)
  .get(
    '/',
    ({ userId }) => {
      console.info('Dashboard data requested', { userId })
      return { value: 'Admin stuff' }
    },
    {
      requireAuth: true,
      response: { 200: t.Object({ value: t.String() }) },
    },
  )
