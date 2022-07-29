import { UserMeta } from '@app/models'
import { API_WHOAMI, ROUTE_LOGIN } from '@app/routes'
import { configuredFetcher } from '@app/utils'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/dist/client/router'
import Head from 'next/head'
import React from 'react'
import { Toaster } from 'react-hot-toast'
import useSWR from 'swr'
import Footer from './main/footer'
import { Sidebar } from './main/sidebar'
import Topbar from './main/top-bar'

export interface LayoutProps {
  children: React.ReactNode
}

export interface PageHeadProps {
  title: string
}

export const Layout = (props: LayoutProps) => {
  const { data: meta, error } = useSWR<UserMeta>(
    API_WHOAMI,
    configuredFetcher({
      method: 'POST',
    }),
  )

  const router = useRouter()
  if (error) {
    router.replace(ROUTE_LOGIN)
  }

  return (
    <>
      <main className="flex flex-row h-full bg-dark">
        <Toaster
          toastOptions={{
            error: {
              icon: null,
              style: {
                background: '#ea5455',
                color: 'white',
              },
            },
          }}
        />

        <Sidebar className="flex flex-col bg-medium h-screen sticky top-0 w-80" />

        <div className="flex flex-col w-full px-7 pt-4">
          <Topbar className="flex flex-row mb-4" meta={meta} />

          <div className="flex flex-col h-full">{props.children}</div>

          <Footer className="mt-auto" />
        </div>
      </main>
    </>
  )
}

export const SingleFormLayout = (props: LayoutProps) => {
  return (
    <>
      <main className="flex flex-row h-full bg-dark">
        <Toaster
          toastOptions={{
            error: {
              icon: null,
              style: {
                background: '#ea5455',
                color: 'white',
              },
            },
          }}
        />

        <div className="h-screen" />

        <div className="flex flex-col w-full px-7 pt-4">
          <div className="flex flex-col h-full">{props.children}</div>

          <Footer className="mt-auto" />
        </div>
      </main>
    </>
  )
}

export const PageHead = (props: React.PropsWithChildren<PageHeadProps>) => {
  const { t } = useTranslation('head')

  return (
    <>
      <Head>
        <title>{t('title-param', { param: props.title })}</title>
        {props.children}
      </Head>
    </>
  )
}