import {
  HTMLAttributes,
  forwardRef,
  memo,
  useLayoutEffect,
  useRef,
  RefObject,
  useImperativeHandle,
  ReactElement,
  cloneElement,
} from 'react';

import {
  useFloating,
  flip as fuiFlip,
  shift as fuiShift,
  offset as fuiOffset,
  autoUpdate,
  Placement,
  // Strategy,
} from '@floating-ui/react-dom';

import { css, cx } from '@emotion/css';

import Blanket from '../Blanket';

export const NAME = 'ucl-overlay';

export interface OverlayProps
  extends HTMLAttributes<HTMLDivElement> {
  reference: RefObject<HTMLElement | null>;
  placement?: Placement;
  blanket?: boolean;
  flip?: boolean;
  shift?: boolean;
  offset?: number;
  arrow?: ReactElement;
  arrowClassName?: string;
  onBlanketClick?: (
    ev: React.MouseEvent<HTMLDivElement>
  ) => void;
}

export type Ref = HTMLDivElement | null;

const Overlay = forwardRef<Ref, OverlayProps>(
  (
    {
      reference,
      placement = 'bottom',
      blanket = false,
      flip = true,
      shift = true,
      offset = 0,
      arrow,
      className,
      arrowClassName,
      onBlanketClick,
      children,
      ...props
    }: OverlayProps,
    forwardedRef
  ) => {
    const ref = useRef(null);
    const arrowRef = useRef<HTMLElement>(null);

    useImperativeHandle<Ref, Ref>(
      forwardedRef,
      () => ref.current
    );

    const fuiMiddleware = [];
    if (flip) fuiMiddleware.push(fuiFlip());
    if (shift) fuiMiddleware.push(fuiShift());
    if (offset) fuiMiddleware.push(fuiOffset(offset));

    const {
      x,
      y,
      refs,
      strategy,
      placement: currentPlacement,
    } = useFloating({
      open: true,
      middleware: fuiMiddleware,
      placement,
      // strategy: 'absolute',
      whileElementsMounted: autoUpdate,
    });

    const overlayPlacement = currentPlacement.split(
      '-'
    )[0] as 'left' | 'right' | 'top' | 'bottom';

    useLayoutEffect(() => {
      refs.setReference(reference.current);
    }, [reference, refs]);

    const { width: arrowWidth, height: arrowHeight } =
      arrowRef?.current?.getBoundingClientRect?.() || {
        width: 0,
        height: 0,
      };

    const baseStyle = css`
      z-index: 1000;
    `;

    const style = cx(NAME, baseStyle, className);

    const arrowBaseStyle = cx(
      css`
        position: absolute;
      `,
      overlayPlacement === 'left' &&
        css`
          top: 50%;
        `,
      overlayPlacement === 'right' &&
        css`
          top: 50%;
        `,
      overlayPlacement === 'top' &&
        css`
          left: 50%;
        `,
      overlayPlacement === 'bottom' &&
        css`
          left: 50%;
        `,
      arrowClassName
    );

    let arrowStyle;
    let ArrowComp = null;

    if (arrow) {
      const arrowElement = arrow as ReactElement<
        HTMLAttributes<HTMLElement>
      >;

      arrowStyle = cx(
        arrowBaseStyle,
        overlayPlacement === 'left' &&
          css`
            right: -${arrowWidth}px;
            margin-top: -${arrowHeight / 2}px;
          `,
        overlayPlacement === 'right' &&
          css`
            left: -${arrowWidth}px;
            margin-top: -${arrowHeight / 2}px;
            transform: rotate(180deg);
          `,
        overlayPlacement === 'top' &&
          css`
            bottom: -${arrowHeight}px;
            margin-left: -${arrowWidth / 2}px;
            transform: rotate(180deg);
          `,
        overlayPlacement === 'bottom' &&
          css`
            top: -${arrowHeight}px;
            margin-left: -${arrowWidth / 2}px;
          `,
        arrowElement.props.className
      );

      ArrowComp = cloneElement(arrowElement, {
        className: arrowStyle,
        // @ts-expect-error ref typing - todo
        ref: arrowRef,
      });
    }

    return (
      <>
        {blanket && <Blanket onClick={onBlanketClick} />}
        <div
          ref={refs.setFloating}
          className={style}
          style={{
            position: strategy,
            left: x ?? 0,
            top: y ?? 0,
          }}
          {...props}
        >
          {children}
          {ArrowComp}
        </div>
      </>
    );
  }
);

export default memo(Overlay);
