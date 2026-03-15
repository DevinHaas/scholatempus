import { t } from 'elysia'
import { dbModel } from '../../db/model'

// Build intermediate objects from dbModel spreads to avoid infinite type instantiation
const _classDataInsert = t.Object({ ...dbModel.insert.classData })
const _specialFunctionInsert = t.Object({ ...dbModel.insert.specialFunction })

export const ClassDataBody = t.Omit(_classDataInsert, ['classDataId'] as const)
export const SpecialFunctionBody = t.Omit(_specialFunctionInsert, ['specialFunctionId'] as const)

export const UpsertProfileBody = t.Object({
  classData: ClassDataBody,
  specialFunctionData: SpecialFunctionBody,
})

export type UpsertProfileBodyType = typeof UpsertProfileBody.static

export const UpsertProfileResponse = t.Object({
  userId: t.String(),
  message: t.String(),
})

export const CheckProfileExistsResponse = t.Object({
  exists: t.Boolean(),
})

const _classDataSelect = t.Object({ ...dbModel.select.classData })
const _specialFunctionSelect = t.Object({ ...dbModel.select.specialFunction })

export const GetProfileResponse = t.Object({
  message: t.String(),
  profile: t.Object({
    classData: t.Union([_classDataSelect, t.Null()]),
    specialFunctionData: t.Union([_specialFunctionSelect, t.Null()]),
  }),
})
