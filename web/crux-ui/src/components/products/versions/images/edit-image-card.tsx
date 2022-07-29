import { DyoButton } from '@app/elements/dyo-button'
import { DyoCard } from '@app/elements/dyo-card'
import DyoImgButton from '@app/elements/dyo-img-button'
import { DyoConfirmationModal } from '@app/elements/dyo-modal'
import useConfirmation from '@app/hooks/use-confirmation'
import {
  ContainerConfig,
  DeleteImageMessage,
  PatchImageMessage,
  VersionImage,
  WS_TYPE_DELETE_IMAGE,
  WS_TYPE_PATCH_IMAGE,
} from '@app/models'
import { containerConfigSchema, getValidationError } from '@app/validation'
import { WebSocketEndpoint } from '@app/websockets/client'
import useTranslation from 'next-translate/useTranslation'
import { useState } from 'react'
import EditImageConfig from './edit-image-config'
import EditImageHeading from './edit-image-heading'
import EditImageJson from './edit-image-json'
import EditImageTags from './edit-image-tags'

export type EditImageCardSelection = 'tag' | 'config' | 'json'

interface EditImageCardProps {
  disabled?: boolean
  image: VersionImage
  tags: string[]
  versionSock: WebSocketEndpoint
  onTagSelected: (tag: string) => void
}

const EditImageCard = (props: EditImageCardProps) => {
  const { t } = useTranslation('images')

  const { tags, image, versionSock: sock, disabled } = props

  const [selection, setSelection] = useState<EditImageCardSelection>('tag')
  const [deleteModalConfig, confirmDelete] = useConfirmation()
  const [parseError, setParseError] = useState<string>(null)

  const onPatch = (id: string, config: Partial<ContainerConfig>) => {
    setParseError(null)

    sock.send(WS_TYPE_PATCH_IMAGE, {
      id,
      config,
    } as PatchImageMessage)
  }

  const onDelete = () =>
    confirmDelete(() =>
      sock.send(WS_TYPE_DELETE_IMAGE, {
        imageId: image.id,
      } as DeleteImageMessage),
    )

  const onParseError = (err: Error) => setParseError(err.message)

  const errorMessage = parseError ?? getValidationError(containerConfigSchema, image.config)?.message

  return (
    <>
      <DyoCard className="flex flex-col flex-grow px-6 pb-6 pt-4">
        <div className="flex flex-row items-start mb-4">
          <EditImageHeading
            imageName={image.name}
            imageTag={image.tag}
            containerName={image.config.name}
            errorMessage={errorMessage}
          />

          <DyoButton
            text
            thin
            textColor="text-bright"
            underlined={selection === 'tag'}
            onClick={() => setSelection('tag')}
            className="ml-auto"
            heightClassName="pb-2"
          >
            {t('tag')}
          </DyoButton>

          <DyoButton
            text
            thin
            textColor="text-bright"
            underlined={selection === 'config'}
            onClick={() => setSelection('config')}
            className="mx-8"
            heightClassName="pb-2"
          >
            {t('config')}
          </DyoButton>

          <DyoButton
            text
            thin
            textColor="text-bright"
            underlined={selection === 'json'}
            onClick={() => setSelection('json')}
            className="mr-0"
            heightClassName="pb-2"
          >
            {t('json')}
          </DyoButton>

          {disabled ? null : (
            <DyoImgButton className="ml-6" onClick={() => onDelete()} src="/trash-can.svg" alt={t('delete')} />
          )}
        </div>

        {selection === 'tag' ? (
          <EditImageTags
            disabled={disabled}
            selected={props.image.tag}
            tags={tags}
            onTagSelected={props.onTagSelected}
          />
        ) : selection === 'config' ? (
          <EditImageConfig disabled={disabled} config={image.config} onPatch={it => onPatch(image.id, it)} />
        ) : (
          <EditImageJson
            disabled={disabled}
            config={image.config}
            onPatch={it => onPatch(image.id, it)}
            onParseError={onParseError}
          />
        )}
      </DyoCard>

      <DyoConfirmationModal
        config={deleteModalConfig}
        title={t('common:confirmDelete', { name: image.name })}
        description={t('deleteDescription', { name: image.name })}
        confirmText={t('common:delete')}
        className="w-1/4"
        confirmColor="bg-error-red"
      />
    </>
  )
}

export default EditImageCard