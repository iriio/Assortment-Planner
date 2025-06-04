import React from "react";
import {
  CaretRight,
  MagnifyingGlass,
  FunnelSimple,
  Books,
  CurrencyDollar,
  Scales,
  Percent,
  ChartBar,
  Info,
  SquaresFour,
  List,
  Layout,
  Table,
  Stack,
  Columns,
  Plus,
  Package,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  CaretDown,
  CaretLeft,
  PencilSimple,
  Eye,
  X,
  ArrowUp,
  CheckCircle,
  CheckSquare,
  List as MenuList,
  Bell,
  CloudArrowUp,
  PencilLine,
  Sliders,
  DotsThreeVertical,
  SquaresFour as RectangleGroup,
  PlusCircle,
  SquaresFour as Squares2X2,
  Warning,
} from "@phosphor-icons/react";

// Export all icons with their application-specific names
export const ChevronRightIcon = CaretRight;
export const MagnifyingGlassIcon = MagnifyingGlass;
export const FunnelIcon = FunnelSimple;
export const BookOpenIcon = Books;
export const CurrencyDollarIcon = CurrencyDollar;
export const ScaleIcon = Scales;
export const PercentIcon = Percent;
export const ChartBarIcon = ChartBar;
export const InformationCircleIcon = Info;
export const ViewGridIcon = SquaresFour;
export const ViewListIcon = List;
export const LayoutDashboardIcon = Layout;
export const TableCellsIcon = Table;
export const RectangleStackIcon = Stack;
export const ViewColumnsIcon = Columns;
export const PlusIcon = Plus;
export const CollectionIcon = Package;
export const MinusSmallIcon = Minus;
export const ArrowUpRightIcon = ArrowUpRight;
export const ArrowDownLeftIcon = ArrowDownLeft;
export const MinusIcon = Minus;
export const DocumentTextIcon = FileText;
export const ChevronDownIcon = CaretDown;
export const ChevronLeftIcon = CaretLeft;
export const PencilIcon = PencilSimple;
export const EyeIcon = Eye;
export const XMarkIcon = X;
export const ArrowUpTrayIcon = ArrowUp;
export const ExclamationTriangleIcon = Warning;
export const CheckCircleIcon = CheckCircle;
export const CheckBadgeIcon = CheckSquare;
export const MenuIcon = MenuList;
export const BellIcon = Bell;
export const CloudArrowUpIcon = CloudArrowUp;
export const PencilSquareIcon = PencilLine;
export const AdjustmentsHorizontalIcon = Sliders;
export const EllipsisVerticalIcon = DotsThreeVertical;
export const RectangleGroupIcon = RectangleGroup;
export const PlusCircleIcon = PlusCircle;
export const Squares2X2Icon = Squares2X2;

export const TagIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 6h.008v.008H6V6z"
    />
  </svg>
);
