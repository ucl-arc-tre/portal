import { memo } from 'react';

import AlertTriangleSvg from './svgs/AlertTriangleSvg';
import ArrowLeftSvg from './svgs/ArrowLeftSvg';
import AvatarSvg from './svgs/AvatarSvg';
import CalendarSvg from './svgs/CalendarSvg';
import CheckCircleSvg from './svgs/CheckCircleSvg';
import CheckSvg from './svgs/CheckSvg';
import ChevronDownSvg from './svgs/ChevronDownSvg';
import ChevronLeftSvg from './svgs/ChevronLeftSvg';
import ChevronRightSvg from './svgs/ChevronRightSvg';
import ChevronUpSvg from './svgs/ChevronUpSvg';
import CodeSvg from './svgs/CodeSvg';
import DatabaseSvg from './svgs/DatabaseSvg';
import DownloadCloudSvg from './svgs/DownloadCloudSvg';
import Edit2Svg from './svgs/Edit2Svg';
import GridSvg from './svgs/GridSvg';
import HardDriveSvg from './svgs/HardDriveSvg';
import HelpCircleSvg from './svgs/HelpCircleSvg';
import HomeSvg from './svgs/HomeSvg';
import ImageSvg from './svgs/ImageSvg';
import InfoSvg from './svgs/InfoSvg';
import LayoutSvg from './svgs/LayoutSvg';
import ListSvg from './svgs/ListSvg';
import LockSvg from './svgs/LockSvg';
import LogOutSvg from './svgs/LogOutSvg';
import MapPinSvg from './svgs/MapPinSvg';
import Maximize2Svg from './svgs/Maximize2Svg';
import MenuSvg from './svgs/MenuSvg';
import MessageSquareSvg from './svgs/MessageSquareSvg';
import MinusSvg from './svgs/MinusSvg';
import MousePointerSvg from './svgs/MousePointerSvg';
import PlusSvg from './svgs/PlusSvg';
import PrinterSvg from './svgs/PrinterSvg';
import SearchSvg from './svgs/SearchSvg';
import SettingsSvg from './svgs/SettingsSvg';
import Share2Svg from './svgs/Share2Svg';
import ShieldSvg from './svgs/ShieldSvg';
import TerminalSvg from './svgs/TerminalSvg';
import UploadSvg from './svgs/UploadSvg';
import UserSvg from './svgs/UserSvg';
import XCircleSvg from './svgs/XCircleSvg';
import XSquareSvg from './svgs/XSquareSvg';
import XSvg from './svgs/XSvg';
// add imports SVGs here

// social
import FacebookSvg from './svgs/social/FacebookSvg';
import FlickrSvg from './svgs/social/FlickrSvg';
import InstagramSvg from './svgs/social/InstagramSvg';
import SoundcloudSvg from './svgs/social/SoundcloudSvg';
import TiktokSvg from './svgs/social/TiktokSvg';
import XSocialSvg from './svgs/social/XSvg';
import YoutubeSvg from './svgs/social/YoutubeSvg';

// internal
import EmptySvg from './svgs/internal/EmptySvg';

import BaseIcon, { BaseIconProps } from './BaseIcon';

export interface IconProps extends BaseIconProps {}

const Icon = ({ ...props }: IconProps) => {
  return <BaseIcon {...props} />;
};

export interface SpecificIconProps extends Omit<BaseIconProps, 'svg'> {}

const AlertTriangleIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={AlertTriangleSvg}
    {...props}
  />
);
const ArrowLeftIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ArrowLeftSvg}
    {...props}
  />
);
const AvatarIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={AvatarSvg}
    {...props}
  />
);
const CalendarIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={CalendarSvg}
    {...props}
  />
);
const CheckCircleIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={CheckCircleSvg}
    {...props}
  />
);
const CheckIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={CheckSvg}
    {...props}
  />
);
const ChevronDownIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ChevronDownSvg}
    {...props}
  />
);
const ChevronLeftIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ChevronLeftSvg}
    {...props}
  />
);
const ChevronRightIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ChevronRightSvg}
    {...props}
  />
);
const ChevronUpIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ChevronUpSvg}
    {...props}
  />
);
const CodeIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={CodeSvg}
    {...props}
  />
);
const DatabaseIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={DatabaseSvg}
    {...props}
  />
);
const DownloadCloudIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={DownloadCloudSvg}
    {...props}
  />
);
const Edit2Icon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={Edit2Svg}
    {...props}
  />
);
const GridIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={GridSvg}
    {...props}
  />
);
const HardDriveIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={HardDriveSvg}
    {...props}
  />
);
const HelpCircleIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={HelpCircleSvg}
    {...props}
  />
);
const HomeIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={HomeSvg}
    {...props}
  />
);
const ImageIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ImageSvg}
    {...props}
  />
);
const InfoIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={InfoSvg}
    {...props}
  />
);
const LayoutIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={LayoutSvg}
    {...props}
  />
);
const ListIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ListSvg}
    {...props}
  />
);
const LockIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={LockSvg}
    {...props}
  />
);
const LogOutIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={LogOutSvg}
    {...props}
  />
);
const MapPinIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={MapPinSvg}
    {...props}
  />
);
const Maximize2Icon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={Maximize2Svg}
    {...props}
  />
);
const MenuIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={MenuSvg}
    {...props}
  />
);
const MessageSquareIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={MessageSquareSvg}
    {...props}
  />
);
const MinusIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={MinusSvg}
    {...props}
  />
);
const MousePointerIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={MousePointerSvg}
    {...props}
  />
);
const PlusIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={PlusSvg}
    {...props}
  />
);
const PrinterIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={PrinterSvg}
    {...props}
  />
);
const SearchIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={SearchSvg}
    {...props}
  />
);
const SettingsIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={SettingsSvg}
    {...props}
  />
);
const Share2Icon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={Share2Svg}
    {...props}
  />
);
const ShieldIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={ShieldSvg}
    {...props}
  />
);
const TerminalIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={TerminalSvg}
    {...props}
  />
);
const UploadIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={UploadSvg}
    {...props}
  />
);
const UserIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={UserSvg}
    {...props}
  />
);
const XCircleIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={XCircleSvg}
    {...props}
  />
);
const XSquareIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={XSquareSvg}
    {...props}
  />
);
const XIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={XSvg}
    {...props}
  />
);
// add more icons here

// social
const FacebookIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={FacebookSvg}
    {...props}
  />
);
const FlickrIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={FlickrSvg}
    {...props}
  />
);
const InstagramIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={InstagramSvg}
    {...props}
  />
);
const SoundcloudIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={SoundcloudSvg}
    {...props}
  />
);
const TiktokIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={TiktokSvg}
    {...props}
  />
);
const XSocialIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={XSocialSvg}
    {...props}
  />
);
const YoutubeIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={YoutubeSvg}
    {...props}
  />
);

// internal
const EmptyIcon = ({ ...props }: SpecificIconProps) => (
  <Icon
    svg={EmptySvg}
    {...props}
  />
);

const MemoIcon = memo(Icon);

const specificIcons = {
  AlertTriangle: AlertTriangleIcon,
  ArrowLeft: ArrowLeftIcon,
  Avatar: AvatarIcon,
  Calendar: CalendarIcon,
  Check: CheckIcon,
  CheckCircle: CheckCircleIcon,
  ChevronDown: ChevronDownIcon,
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  ChevronUp: ChevronUpIcon,
  Code: CodeIcon,
  Database: DatabaseIcon,
  DownloadCloud: DownloadCloudIcon,
  Edit: Edit2Icon,
  Grid: GridIcon,
  HardDrive: HardDriveIcon,
  HelpCircle: HelpCircleIcon,
  Home: HomeIcon,
  Image: ImageIcon,
  Info: InfoIcon,
  Layout: LayoutIcon,
  List: ListIcon,
  Lock: LockIcon,
  LogOut: LogOutIcon,
  MapPin: MapPinIcon,
  Maximize2: Maximize2Icon,
  Menu: MenuIcon,
  MessageSquare: MessageSquareIcon,
  Minus: MinusIcon,
  MousePointer: MousePointerIcon,
  Plus: PlusIcon,
  Printer: PrinterIcon,
  Search: SearchIcon,
  Settings: SettingsIcon,
  Share2: Share2Icon,
  Shield: ShieldIcon,
  Terminal: TerminalIcon,
  Upload: UploadIcon,
  User: UserIcon,
  XCircle: XCircleIcon, // << Typo here. Should be XCircle (note the missing 'c')
  XSquare: XSquareIcon,
  X: XIcon,
  // expose icons here

  // social
  Facebook: FacebookIcon,
  Flickr: FlickrIcon,
  Instagram: InstagramIcon,
  Soundcloud: SoundcloudIcon,
  Tiktok: TiktokIcon,
  XSocial: XSocialIcon,
  Youtube: YoutubeIcon,

  // Internal
  Empty: EmptyIcon,
};

export type SpecificIconsType = typeof specificIcons;

const ExtendedIconConfig = MemoIcon as typeof MemoIcon & SpecificIconsType;

let iconKey: keyof SpecificIconsType;
for (iconKey in specificIcons) {
  ExtendedIconConfig[iconKey] = specificIcons[iconKey];
}

export default ExtendedIconConfig;
