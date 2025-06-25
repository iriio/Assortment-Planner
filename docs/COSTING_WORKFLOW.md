# Costing Workflow Feature

## Overview

The Costing Workflow feature streamlines the process of obtaining quotes from vendors, analyzing costs, and adjusting product pricing to meet margin targets after line planning and design are completed.

## Navigation

### From Program Overview

- Click the "Costing" button in the toolbar (next to the Filter button)
- Only available when a line plan is selected

### From Category Detail

- Click the "Costing" button in the category header
- Available when viewing any category

## Workflow Steps

### 1. Styles Ready for Costing

**Criteria**: Styles must be in one of the following PLM statuses:

- `Designing` - Design work is in progress
- `Finalizing` - Design is being finalized

**What you'll see**:

- Overview dashboard showing number of styles ready for costing
- Grid view of all eligible styles with current cost and margin information
- Quick actions to create RFQs or review analysis

### 2. Request for Quotes (RFQ) Creation

**Process**:

1. Click "Create New RFQ" from the overview or RFQ tab
2. Fill in RFQ details:
   - Title and description
   - Due date for vendor responses
3. Select styles to include in the RFQ
4. Select vendors to send the RFQ to
5. Click "Create RFQ" to save as draft

**Features**:

- Automatically generates RFQ numbers (format: RFQ-YYYYMMDD-XXXX)
- Calculates target costs (10% reduction from current costs)
- Distributes target volumes across selected styles

### 3. Sending RFQs to Vendors

**Process**:

1. Go to the RFQ tab
2. Find RFQs in "Draft" status
3. Click "Send RFQ" to send to selected vendors
4. Status changes to "Sent"

**Vendor Information**:

- Pre-configured vendor database with contact details
- Lead times and minimum order quantities
- Specialization categories and ratings

### 4. Quote Collection & Simulation

**For Demo Purposes**:

- Click "Simulate Quote" on sent RFQs
- Select a vendor to simulate their response
- System generates realistic quote variations (85%-115% of target cost)

**Real Implementation Would Include**:

- Email notifications to vendors
- Vendor portal for quote submission
- File attachment support

### 5. Quote Analysis

**Process**:

1. Once quotes are received, click "Analyze Quotes"
2. System automatically:
   - Identifies best quote per style
   - Calculates cost variance from targets
   - Assesses margin impact
   - Provides recommendations

**Recommendation Logic**:

- **Accept**: Cost variance ≤ 10% and margin impact acceptable
- **Negotiate**: Cost variance 10-20%
- **Reject**: Cost variance > 20%
- **Redesign**: Margin impact > 10% reduction

### 6. Cost Adjustments

**Process**:

1. Review analysis recommendations
2. Apply cost adjustments based on accepted quotes
3. System updates style costs and recalculates margins
4. Track adjustment history and approvals

**Impact Tracking**:

- Total cost savings across line plan
- Margin improvement percentage
- Number of affected styles
- Revenue impact

## Key Benefits

1. **Streamlined Vendor Communication**: Centralized RFQ management
2. **Cost Optimization**: Systematic approach to achieving cost targets
3. **Margin Protection**: Impact analysis before making changes
4. **Vendor Management**: Maintain vendor database with performance metrics
5. **Audit Trail**: Complete history of cost changes and decisions

## Technical Implementation

### New Types Added

- **Vendor**: Contact information, capabilities, terms
- **RFQ**: Request details, items, target costs
- **Quote**: Vendor responses with pricing and terms
- **CostingAnalysis**: Analysis results and recommendations
- **CostAdjustment**: Applied cost changes with reasoning

### Services

- **costingService.ts**: Core business logic for RFQ and quote management
- Integration with existing planningService for cost calculations

### UI Components

- **CostingWorkflowPage**: Main workflow interface with tabbed navigation
- Modal dialogs for RFQ creation and quote simulation
- Dashboard cards showing key metrics and progress

## Demo Data

The system includes several styles in "Designing" and "Finalizing" status across different categories:

- **Tops**: 4 styles ready for costing
- **Outerwear**: 3 styles ready for costing
- **Bottoms**: 2 styles ready for costing

Mock vendor data includes suppliers from different regions with varying capabilities and terms.

## Future Enhancements

1. **Vendor Portal**: Self-service interface for vendors
2. **Email Integration**: Automated RFQ distribution
3. **Advanced Analytics**: Cost trend analysis and vendor performance
4. **Approval Workflows**: Multi-level approval for cost changes
5. **Integration**: Connect with ERP systems and procurement tools
