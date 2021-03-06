/**
 * MyMiniFactoryLogin
 * @author williamclot / https://github.com/williamclot
**/

import React, { Component } from 'react';

// Useful functions to manipulate queries in URL
import { toQuery, toParams, randomString } from './utils';


class MyMiniFactoryLogin extends Component {

  static defaultProps = {
    buttonText: 'Sign in to MyMiniFactory',
    onSuccess: () => { },
    onFailure: () => { },
    width: 500,
    height: 620,
  }

  constructor(props) {
    super(props);
    this.onClick = this.onClick;
  }

  onSuccess = (data) => {
    if (!data.access_token) {
      return this.onFailure(new Error('\'access token\' not found'));
    }
    this.props.onSuccess(data);
  }

  onFailure = (error) => {
    this.props.onFailure(error);
  }

  createPopup = (url, title, width, height) => {

    // Calculting dimensions and positions
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    this.externalWindow = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    this.codeCheck = setInterval(() => {
      try {
        const popup = this.externalWindow;

        if (!popup || popup.closed !== false) {
          clearInterval(this.codeCheck);
          return;
        }

        if (popup.location.href === url || popup.location.pathname === 'blank') {
          return;
        }

        popup.close();
        this.onSuccess(toParams(popup.location.hash))

      } catch (error) {
        // Ignore the DOMException: Blocked a frame with origin
        // It's normal when the page is on auth.myminifactory.com (XSS countermeasure)

        // console.error(error)
      }
    }, 500);
  };

  onClick = () => {
    const { clientKey, redirectUri, height, width } = this.props;
    const authServer = "https://auth.myminifactory.com/web/authorize?"
    const search = toQuery({
      client_id: clientKey,
      redirect_uri: redirectUri,
      response_type: "token",
      state: randomString(20) // random 
    });

    this.createPopup(
      authServer + search,
      "MyMiniFactory Login",
      width, //width
      height, //height
    )
  }

  render() {
    const { className, buttonText, children } = this.props;

    return (<button className={className} onClick={this.onClick}>{children || buttonText}</button>);
  }
}
export default MyMiniFactoryLogin;
