import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import Avatar from '../Avatar';
import { ThemeContextProvider } from '../../../theme/useTheme';

describe('Avatar', () => {
  // Snapshot tests

  test('Snapshot: Default', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: Default with disabled prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar disabled />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: icon variant with no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar variant='icon' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: icon variant with disabled prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='icon'
          disabled
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: initials variant with no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar variant='initials' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: initials variant with name prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='initials'
          name='John Doe'
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: initials variant with name prop and disabled prop', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='initials'
          name='John Doe'
          disabled
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: image variant with no props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar variant='image' />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: image variant with name prop only', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='image'
          name='John Doe'
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: image variant with imageUrl prop only', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='image'
          imageUrl='https://www.example.com/image.jpg'
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: image variant with imageUrl and name props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='image'
          imageUrl='https://www.example.com/image.jpg'
          name='John Doe'
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  test('Snapshot: image variant with imageUrl, name and disabled props', () => {
    const renderResult = render(
      <ThemeContextProvider>
        <Avatar
          variant='image'
          imageUrl='https://www.example.com/image.jpg'
          name='John Doe'
          disabled
        />
      </ThemeContextProvider>
    );
    expect(renderResult.container.firstChild).toMatchSnapshot();
  });

  // Interaction tests

  test('Can be found with default testId', () => {
    const defaultTestId = 'ucl-uikit-avatar';
    render(
      <ThemeContextProvider>
        <Avatar />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId(defaultTestId)).toBeInTheDocument();
  });

  test('Can be found with custom testId', () => {
    const testId = 'abc';
    render(
      <ThemeContextProvider>
        <Avatar testId={testId} />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  test('Displays image by default when imageUrl prop is provided', () => {
    const imageUrl = 'https://www.example.com/image.jpg';
    render(
      <ThemeContextProvider>
        <Avatar imageUrl={imageUrl} />
      </ThemeContextProvider>
    );
    const image = screen.getByTestId('ucl-uikit-avatar-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', imageUrl);
  });

  test('Displays image when variant = image & imageUrl prop is provided', () => {
    const imageUrl = 'https://www.example.com/image.jpg';
    render(
      <ThemeContextProvider>
        <Avatar
          variant='image'
          imageUrl={imageUrl}
        />
      </ThemeContextProvider>
    );
    const image = screen.getByTestId('ucl-uikit-avatar-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', imageUrl);
  });

  test('Displays fallback initials when variant = image & imageUrl prop is not provided & name is provided', () => {
    render(
      <ThemeContextProvider>
        <Avatar
          variant='image'
          name='Rupert Blimp'
        />
      </ThemeContextProvider>
    );
    expect(screen.getByText('RB')).toBeInTheDocument();
  });

  test('Displays fallback icon when variant = image & imageUrl prop is not provided & name is not provided', () => {
    render(
      <ThemeContextProvider>
        <Avatar variant='image' />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId('ucl-icon')).toBeInTheDocument();
    expect(
      screen.queryByTestId('ucl-uikit-avatar-image')
    ).not.toBeInTheDocument();
  });

  test('Displays initials when variant = initials & name prop is provided', () => {
    const name = 'Hester McFortune';
    render(
      <ThemeContextProvider>
        <Avatar
          variant='initials'
          name={name}
        />
      </ThemeContextProvider>
    );
    expect(screen.getByText('HM')).toBeInTheDocument();
  });

  test('Displays initials when variant = initials & imageUrl prop is provided & name prop is provided', () => {
    const name = 'Hester McFortune';
    const imageUrl = 'https://www.example.com/image.jpg';
    render(
      <ThemeContextProvider>
        <Avatar
          variant='initials'
          imageUrl={imageUrl}
          name={name}
        />
      </ThemeContextProvider>
    );
    expect(screen.getByText('HM')).toBeInTheDocument();
    expect(
      screen.queryByTestId('ucl-uikit-avatar-image')
    ).not.toBeInTheDocument();
  });

  test('Displays icon when variant = initials & name prop is not provided', () => {
    render(
      <ThemeContextProvider>
        <Avatar variant='initials' />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId('ucl-icon')).toBeInTheDocument();
  });

  test('Displays icon when variant = icon', () => {
    const defaultIconTestId = 'ucl-icon';
    render(
      <ThemeContextProvider>
        <Avatar variant='icon' />
      </ThemeContextProvider>
    );
    expect(screen.getByTestId(defaultIconTestId)).toBeInTheDocument();
  });
});
