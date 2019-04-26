import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import fetch from 'fetch';
import { inject as service } from '@ember/service';
import AuthService from 'shlack/services/auth';

export default class ChannelContainerComponent extends Component {
  @tracked
  messages = [];

  /**
   * @type {AuthService}
   */
  @service auth;

  @action
  async loadMessages() {
    const {
      channel: { id: channelId, teamId }
    } = this.args;

    this.messages = await (await fetch(
      `/api/teams/${teamId}/channels/${channelId}/messages`
    )).json();
  }

  @action
  async createMessage(body) {
    const {
      channel: { id: channelId, teamId }
    } = this.args;

    const resp = await fetch(`/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        channelId,
        teamId,
        body,
        userId: this.auth.currentUserId
      })
    });
    if (!resp.ok) {
      throw new Error('Problem creating message: ' + (await resp.text()));
    }

    const newMessage = await resp.json();
    this.messages = [
      ...this.messages,
      { ...newMessage, user: this.auth.currentUser }
    ];
    return newMessage;
  }
}
