import { DyoCard } from '@app/elements/dyo-card'
import { DyoHeading } from '@app/elements/dyo-heading'
import { Project } from '@app/models'
import { auditToLocaleDate } from '@app/utils'
import clsx from 'clsx'
import useTranslation from 'next-translate/useTranslation'
import Image from 'next/image'
import Link from 'next/link'
import ProjectTypeTag from './project-type-tag'

interface ProjectCardProps {
  className?: string
  project: Project
  titleHref?: string
}

const ProjectCard = (props: ProjectCardProps) => {
  const { project, titleHref, className } = props

  const { t } = useTranslation('projects')

  const image = (
    <Image src="/project_default.svg" alt={t('altPicture', { name: project.name })} width={100} height={100} />
  )

  return (
    <DyoCard className={clsx(className ?? 'p-6', 'flex flex-col flex-grow w-full')}>
      <div className="flex flex-col w-full">
        <div className="flex flex-row">
          {titleHref ? <Link href={titleHref}>{image}</Link> : image}

          <div className="flex flex-col flex-grow">
            <DyoHeading element="h5" className="text-lg text-bright ml-4" href={titleHref}>
              {project.name}
            </DyoHeading>

            <div className="flex flex-row justify-start">
              <span className="text-bright font-bold ml-4">{`${t('common:updatedAt')}:`}</span>

              <span className="text-bright ml-2" suppressHydrationWarning>
                {auditToLocaleDate(project.audit)}
              </span>
            </div>

            <ProjectTypeTag className="ml-auto" type={project.type} />
          </div>
        </div>

        <p className="text-md text-bright mt-4 line-clamp-2 break-words">{project.description}</p>
      </div>
    </DyoCard>
  )
}

export default ProjectCard