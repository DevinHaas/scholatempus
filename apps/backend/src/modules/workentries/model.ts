import { t } from 'elysia'
import { dbModel } from '../../db/model'

// Intermediate variables prevent "Type instantiation is possibly infinite" TS error
const _workEntryInsert = t.Object({ ...dbModel.insert.workTimeEntry })
const _workEntrySelect = t.Object({ ...dbModel.select.workTimeEntry })

// POST body: omit server-generated fields
export const WorkEntryBody = t.Omit(_workEntryInsert, [
  'workTimeEntryId',
  'userId',
  'date',
] as const)

export type WorkEntryBodyType = typeof WorkEntryBody.static

// POST /workentries body
export const AddWorkEntriesBody = t.Object({
  entries: t.Array(WorkEntryBody),
})

export type AddWorkEntriesBodyType = typeof AddWorkEntriesBody.static

export const AddWorkEntriesResponse = t.Object({
  message: t.String(),
  count: t.Number(),
})

// PUT /workentries/:id body — date is optional for updates
const insertFields = dbModel.insert.workTimeEntry
export const UpdateWorkEntryBody = t.Object({
  category: insertFields.category,
  subcategory: insertFields.subcategory,
  workingTime: insertFields.workingTime,
  date: t.Optional(insertFields.date),
})

export type UpdateWorkEntryBodyType = typeof UpdateWorkEntryBody.static

const _singleWorkEntry = t.Object({ ...dbModel.select.workTimeEntry })

export const UpdateWorkEntryResponse = t.Object({
  message: t.String(),
  workEntry: _singleWorkEntry,
})

// GET /workentries response
export const GetWorkEntriesResponse = t.Object({
  message: t.String(),
  workEntries: t.Array(_workEntrySelect),
})

export const DeleteWorkEntryResponse = t.Object({
  message: t.String(),
})

// POST /workentries/import body
export const ImportWorkEntryBody = t.Object({
  date: t.String(), // ISO date string
  workingTime: WorkEntryBody.properties.workingTime,
  category: WorkEntryBody.properties.category,
  subcategory: WorkEntryBody.properties.subcategory,
})

export type ImportWorkEntryBodyType = typeof ImportWorkEntryBody.static

export const ImportWorkEntriesBody = t.Object({
  entries: t.Array(ImportWorkEntryBody),
})
