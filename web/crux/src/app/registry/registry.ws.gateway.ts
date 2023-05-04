import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common'
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Identity } from '@ory/kratos-client'
import WsExceptionFilter from 'src/filters/ws.exception-filter'
import { WsAuthorize, WsMessage } from 'src/websockets/common'
import WsParam from 'src/websockets/decorators/ws.param.decorator'
import SocketMessage from 'src/websockets/decorators/ws.socket-message.decorator'
import WsRedirectInterceptor from 'src/websockets/interceptors/ws.redirect.interceptor'
import TeamService from '../team/team.service'
import JwtAuthGuard, { IdentityFromSocket } from '../token/jwt-auth.guard'
import RegistryClientProvider from './registry-client.provider'
import { IMAGE_FILTER_TAKE } from './registry.const'
import {
  FetchImageTagsMessage,
  FindImageMessage,
  FindImageResultMessage,
  RegistryImageTagsMessage,
} from './registry.message'

const TeamId = () => WsParam('teamId')

@WebSocketGateway({
  namespace: 'teams/:teamId/registries',
  redirectFrom: '/registries',
})
@UseFilters(WsExceptionFilter)
@UseGuards(JwtAuthGuard)
@UseInterceptors(WsRedirectInterceptor)
export default class RegistryWebSocketGateway {
  constructor(private readonly registryClients: RegistryClientProvider, private readonly teamService: TeamService) {}

  @WsAuthorize()
  async onAuthorize(@TeamId() teamId: string, @IdentityFromSocket() identity: Identity): Promise<boolean> {
    return await this.teamService.checkUserActiveTeam(teamId, identity)
  }

  @SubscribeMessage('find-image')
  async findImage(
    @TeamId() teamId: string,
    @SocketMessage() message: FindImageMessage,
  ): Promise<WsMessage<FindImageResultMessage>> {
    const api = await this.registryClients.getByRegistryId(teamId, message.registryId)
    const images = await api.catalog(message.filter, IMAGE_FILTER_TAKE)

    return {
      type: 'find-image-result',
      data: {
        registryId: message.registryId,
        images: images.map(it => ({
          id: '',
          name: it,
          tags: 0,
        })),
      },
    } as WsMessage<FindImageResultMessage>
  }

  @SubscribeMessage('fetch-image-tags')
  async fetchImageTags(
    @TeamId() teamId: string,
    @SocketMessage() message: FetchImageTagsMessage,
  ): Promise<WsMessage<RegistryImageTagsMessage>> {
    const api = await this.registryClients.getByRegistryId(teamId, message.registryId)
    const tags = message.images.map(it => api.tags(it))

    return {
      type: 'registry-image-tags',
      data: {
        registryId: message.registryId,
        images: await Promise.all(tags),
      },
    } as WsMessage<RegistryImageTagsMessage>
  }
}