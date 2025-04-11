import { memo, HTMLAttributes } from 'react';
import { css, cx } from '@emotion/css';
import { Divider, UclLogo, useTheme } from '../..';
import FooterColumn from './FooterColumn';
import SocialLink from './SocialLink';
import FooterNavLink from './FooterNavLink';

export const NAME = 'ucl-uikit-footer';

export interface FooterProps extends HTMLAttributes<HTMLDivElement> {
  testId?: string;
  disclaimer?: string;
  freedomOfInformation?: string;
  accessibility?: string;
  cookies?: string;
  privacy?: string;
  slaveryStatement?: string;
}

const Footer = ({
  testId = NAME,
  className,
  disclaimer = 'https://www.ucl.ac.uk/legal-services/disclaimer',
  freedomOfInformation = 'https://www.ucl.ac.uk/foi',
  accessibility = 'https://www.ucl.ac.uk/accessibility',
  cookies = 'https://www.ucl.ac.uk/legal-services/privacy/cookie-policy',
  privacy = 'https://www.ucl.ac.uk/legal-services/privacy',
  slaveryStatement = 'https://www.ucl.ac.uk/commercial-procurement/modern-day-slavery-statement',
  children,
  ...props
}: FooterProps) => {
  const copyrightYear = new Date().getFullYear();

  const [theme] = useTheme();

  const baseStyle = css`
    background-color: ${theme.color.neutral.grey90};
    color: ${theme.color.text.inverted};
    font-family: ${theme.font.family.primary};
    font-weight: 300;
    padding: ${theme.padding.p40} 0 ${theme.padding.p40};
  `;

  const style = cx(NAME, baseStyle, className);

  const containerStyle = css`
    max-width: 1080px;
    margin: 0 auto;
    padding: 0 ${theme.padding.p24};
  `;

  const appLinksStyle = css`
    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      margin-right: 10%;
      display: flex;
    }
  `;

  const logoAndSocialLinksStyle = css`
    margin-top: ${theme.margin.m40};
    padding: ${theme.padding.p8} 0;
    box-sizing: border-box;

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  `;

  const uclLogoStyle = css`
    height: 32px;
    color: ${theme.color.neutral.grey90};

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      margin-right: auto;
    }
  `;

  const socialLinksStyle = css`
    margin: ${theme.margin.m16} 0 ${theme.margin.m8};

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      margin: 0;
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  `;

  const contactInfoAndCopyrightStyle = css`
    padding: ${theme.padding.p12} 0;
    color: ${theme.color.neutral.grey20};
    display: flex;
    flex-direction: column;
    font-size: ${theme.font.size.f14};

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      flex-direction: row;
      align-items: center;
    }
  `;

  const addressStyle = css`
    margin-right: ${theme.margin.m32};
  `;

  const telephoneStyle = css`
    margin-top: ${theme.margin.m16};
    color: inherit;
    text-decoration: none;
    transition: color 0.2s ease-out;

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      margin-top: 0;
    }

    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
    }

    &:hover {
      text-decoration: underline;
    }
  `;

  const copyrightStyle = css`
    margin-top: ${theme.margin.m16};

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      margin-top: 0;
      margin-left: auto;
    }
  `;

  const legalLinksStyle = css`
    margin-top: ${theme.margin.m16};
    padding: ${theme.padding.p8} 0;
    display: flex;
    flex-direction: column;

    @media screen and (min-width: ${theme.breakpoints.tablet}px) {
      flex-direction: row;
      align-items: center;
    }
  `;

  const legalLinkStyle = css`
    margin-bottom: ${theme.margin.m8};
    margin-right: ${theme.margin.m32};
    text-decoration: none;
    color: ${theme.color.neutral.grey20};
    transition: color 0.2s ease-out;

    &:focus-visible {
      outline: none;
      box-shadow: ${theme.boxShadow.focus};
    }

    &:hover {
      text-decoration: underline;
    }
  `;

  return (
    <div
      className={style}
      data-testid={testId}
      {...props}
    >
      <div className={containerStyle}>
        <nav className={appLinksStyle}>{children}</nav>

        <div className={logoAndSocialLinksStyle}>
          <UclLogo className={uclLogoStyle} />

          <div className={socialLinksStyle}>
            <SocialLink socialNetwork='facebook' />
            <SocialLink socialNetwork='flickr' />
            <SocialLink socialNetwork='tiktok' />
            <SocialLink socialNetwork='youtube' />
            <SocialLink socialNetwork='soundcloud' />
            <SocialLink socialNetwork='x' />
            <SocialLink socialNetwork='instagram' />
          </div>
        </div>

        <Divider />

        <div className={contactInfoAndCopyrightStyle}>
          <span className={addressStyle}>
            University College London, Gower Street, London, WC1E 6BT
          </span>
          <a
            className={telephoneStyle}
            href='tel:+4402076792000'
          >
            Tel: +44 (0) 20 7679 2000
          </a>
          <span className={copyrightStyle}>© {copyrightYear} UCL</span>
        </div>

        <div className={legalLinksStyle}>
          <a
            className={legalLinkStyle}
            href={disclaimer}
          >
            Disclaimer
          </a>
          <a
            className={legalLinkStyle}
            href={freedomOfInformation}
          >
            Freedom of Information
          </a>
          <a
            className={legalLinkStyle}
            href={accessibility}
          >
            Accessibility
          </a>
          <a
            className={legalLinkStyle}
            href={cookies}
          >
            Cookies
          </a>
          <a
            className={legalLinkStyle}
            href={privacy}
          >
            Privacy
          </a>
          <a
            className={legalLinkStyle}
            href={slaveryStatement}
          >
            Slavery statement
          </a>
        </div>
      </div>
    </div>
  );
};

const MemoFooter = memo(Footer);

export interface IFooterSubComponents {
  Column: typeof FooterColumn;
  NavLink: typeof FooterNavLink;
}

const FooterWithSubComponents = MemoFooter as typeof MemoFooter &
  IFooterSubComponents;

FooterWithSubComponents.Column = FooterColumn;
FooterWithSubComponents.NavLink = FooterNavLink;

export default FooterWithSubComponents;
