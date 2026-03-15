import { spreads } from './utils'
import {
  classDataTable,
  specialFunctionTable,
  workTimeEntryTable,
  profileTable,
} from '../../db/schema.js'

export const dbModel = {
  insert: spreads(
    {
      classData: classDataTable,
      specialFunction: specialFunctionTable,
      workTimeEntry: workTimeEntryTable,
      profile: profileTable,
    },
    'insert',
  ),
  select: spreads(
    {
      classData: classDataTable,
      specialFunction: specialFunctionTable,
      workTimeEntry: workTimeEntryTable,
      profile: profileTable,
    },
    'select',
  ),
} as const
