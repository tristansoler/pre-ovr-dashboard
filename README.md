# Pre-OVR Dashboard

## Project Overview
This project is a Single Page Application (SPA) built with Angular that displays multiple tabular datasets from CSV files. The application provides a flexible, interactive dashboard where users can view and manipulate multiple data tables simultaneously.

The core functionality allows users to:
- Select which data tables to display from a sidebar
- Drag tables to position them anywhere in the dashboard
- Resize tables to adjust their dimensions
- Pin tables to fix their position and size
- Sort and filter data within each table by column values

## Technical Architecture

### Data Source
- All data comes from CSV files stored in `src/assets/input/`
- Files include:
  - scs_002_ec.csv
  - scs_001_sec.csv
  - str_sfdr8_aec.csv
  - str_006_sec.csv
  - str_005_ec.csv
  - str_004_asec.csv
  - str_003b_ec.csv
  - str_003_ec.csv
  - str_002_ec.csv
  - str_001_s.csv
  - out_issuer_clarity.csv
  - new_issuers_clarity.csv
  - incl_benchmarks.csv
  - incl_carteras.csv
  - delta_clarity.csv
  - delta_benchmarks.csv
  - delta_carteras.csv
  - zombie_analysis.csv
- Each CSV file has a header row with column names
- The application dynamically loads these files on startup

### Component Structure

#### 1. App Component
- Main container component
- Manages the overall layout
- Coordinates communication between sidebar and data windows

#### 2. Sidebar Component
- Displays a list of available data tables
- Located on the left side of the screen
- Allows users to select which tables to display in the main area
- Each table name is clickable to add it to the dashboard

#### 3. Data Window Component
- Container for each data table
- Features:
  - Draggable: Can be positioned anywhere in the main area
  - Resizable: Can be resized using a resize handle
  - Pinnable: Can be "pinned" to fix its position and size
  - Closable: Can be removed from the dashboard
- Includes title bar with table name and control buttons

#### 4. Data Table Component
- Displays the actual tabular data
- Features:
  - Sortable columns (click header to sort)
  - Column filters (input field below each column header)
  - Responsive layout within its container

### Services

#### Data Service
- Responsible for loading and managing CSV data
- Uses HttpClient to fetch CSV files
- Uses PapaParse to parse CSV content
- Maintains mapping between table names and filenames
- Tracks currently active tables and their states
- Provides methods for:
  - Loading CSV data
  - Getting table data
  - Adding/removing tables from the dashboard
  - Updating table positions and sizes
  - Toggling pinned state

### Technical Implementation Details

#### Table Mapping System
- A simple array in the DataService defines the relationship between display names and filenames:
```typescript
private tableMapping = [
  { id: uuidv4(), name: 'Table 1', filename: 'scs_002_ec.csv' },
  { id: uuidv4(), name: 'Table 2', filename: 'scs_001_sec.csv' },
  // etc.
];
```
- This makes it easy to add or remove tables by updating this array

#### Drag and Resize Functionality
- Uses Angular CDK (`@angular/cdk/drag-drop`) for drag functionality
- Custom resize handling using native mouse events
- Position and size information stored in DataService

#### Pinning Mechanism
- When a table is pinned:
  - Drag functionality is disabled
  - Resize functionality is disabled
  - Visual indicator shows it's pinned (border changes)
  - Z-index is increased to keep it above other tables

#### Table Sorting and Filtering
- Column sorting:
  - Click on column header to sort by that column
  - Click again to toggle between ascending/descending
  - Intelligent sorting (numeric vs alphabetical)
- Column filtering:
  - Input field under each column header
  - Filters as you type (case-insensitive)
  - Multiple filters can be applied simultaneously

### UI/UX Design

#### Layout
- Fixed sidebar on the left (~250px width)
- Main content area fills remaining space
- Tables positioned absolutely within the main area
- Tables can overlap (z-index handling)

#### Table Window Design
- Clean, minimal window styling
- Header with table name and controls
- Visible resize handle in bottom-right corner
- Scroll functionality when content exceeds window size

#### Visual Indicators
- Hover effects on interactive elements
- Color changes to indicate pinned state
- Sort direction indicators in column headers
- Filter fields clearly associated with their columns

### Dependencies
- Angular core framework
- Angular CDK for drag functionality
- PapaParse for CSV parsing
- UUID for generating unique identifiers

### Extensibility
This dashboard is designed to be highly extensible:
- New data sources can be added by simply updating the table mapping
- UI styling can be customized to match existing design systems
- Additional functionality (export, charts, etc.) can be added as needed

## Deployment and Integration
While initially developed as a standalone application, this dashboard is designed to be easily integrated into other Angular applications:
- Components use encapsulated styles
- Service can be integrated with existing data providers
- Theming can be adjusted to match parent application

## Future Enhancements
Potential areas for expansion:
- Save/restore dashboard layout
- Additional visualization options (charts, graphs)
- Data editing capabilities
- Connection to real-time data sources