# Requirements Document

## Introduction

The Lotto Graveyard is a web application that allows users to explore their Powerball lottery numbers' historical performance and receive tarot-based fortunes. Users can enter Powerball numbers (5 white ball numbers from 1-69 and 1 Powerball from 1-26) manually or via webcam, view historical win analysis and frequency statistics displayed on a tombstone, and receive AI-generated tarot readings based on their numbers and personal questions. Historical data is stored as a flat file updated nightly via GitHub Action. The application uses 1909 Rider-Waite artistic styling throughout.

## Glossary

- **System**: The Lotto Graveyard web application
- **User**: A person visiting the website to analyze Powerball numbers and receive tarot readings
- **Lottery_Numbers**: A set of Powerball numbers consisting of 5 white ball numbers (1-69) and 1 Powerball number (1-26) that the User wants to analyze
- **White_Ball_Numbers**: The set of 5 numbers between 1 and 69 from the Powerball drawing
- **Powerball_Number**: The single number between 1 and 26 from the Powerball drawing
- **Historical_Database**: Flat file containing past Powerball drawing results, updated nightly via GitHub Action
- **Tombstone**: Visual display showing lottery numbers and their historical performance
- **Epitaph**: Text description of the lottery numbers' performance history
- **Tarot_Reading**: Three-card tarot spread generated based on lottery numbers
- **Fortune**: AI-generated interpretation of tarot cards in relation to User's question
- **Webcam_Scanner**: Component that captures and processes lottery ticket images
- **Fortune_Generator**: AWS Lambda function that generates fortunes using an AI model
- **Static_Site**: HTML/CSS/JavaScript files served without server-side rendering
- **Rider_Waite_Style**: 1909 Rider-Waite tarot card art style used for visual design

## Requirements

### Requirement 1: Number Input

**User Story:** As a User, I want to enter my Powerball numbers through multiple methods, so that I can analyze them regardless of how I have them available.

#### Acceptance Criteria

1. THE System SHALL provide a manual input interface for Lottery_Numbers
2. THE System SHALL provide a webcam-based input interface for Lottery_Numbers
3. WHEN the User selects manual input, THE System SHALL display a numeric entry form with separate fields for White_Ball_Numbers and Powerball_Number
4. WHEN the User selects webcam input, THE System SHALL activate the Webcam_Scanner
5. WHEN Lottery_Numbers are entered, THE System SHALL validate that the entry contains exactly 5 White_Ball_Numbers and exactly 1 Powerball_Number
6. WHEN White_Ball_Numbers are entered, THE System SHALL validate that each number is an integer between 1 and 69 inclusive
7. WHEN a Powerball_Number is entered, THE System SHALL validate that the number is an integer between 1 and 26 inclusive
8. WHEN Lottery_Numbers are entered, THE System SHALL validate that all White_Ball_Numbers are unique with no duplicates
9. IF Lottery_Numbers contain fewer than 5 or more than 5 White_Ball_Numbers, THEN THE System SHALL reject the entry and display an error message indicating that exactly 5 white ball numbers are required
10. IF any White_Ball_Number is outside the range 1 to 69, THEN THE System SHALL reject the entry and display an error message indicating the valid range of 1 to 69 for white balls
11. IF the Powerball_Number is outside the range 1 to 26, THEN THE System SHALL reject the entry and display an error message indicating the valid range of 1 to 26 for the Powerball
12. IF White_Ball_Numbers contain duplicate values, THEN THE System SHALL reject the entry and display an error message indicating that all white ball numbers must be unique
13. IF the Powerball_Number is missing, THEN THE System SHALL reject the entry and display an error message indicating that a Powerball number is required
14. IF the Webcam_Scanner cannot recognize numbers from the image, THEN THE System SHALL display an error message prompting the User to retry or use manual input
15. IF the User submits an empty entry, THEN THE System SHALL reject the entry and display an error message indicating that numbers are required

### Requirement 2: Webcam Number Scanning

**User Story:** As a User, I want to scan my Powerball ticket with my device's camera, so that I can quickly input numbers without manual typing.

#### Acceptance Criteria

1. WHEN the User activates webcam input, THE Webcam_Scanner SHALL request camera permissions
2. IF camera permissions are denied, THEN THE System SHALL display an error message indicating that camera access is required for scanning and SHALL enable manual input
3. WHEN camera permissions are granted, THE Webcam_Scanner SHALL display a live camera feed
4. WHEN a Powerball ticket is in view, THE Webcam_Scanner SHALL attempt to detect and extract Lottery_Numbers from the image
5. IF no Lottery_Numbers are detected within 30 seconds of continuous scanning, THEN THE Webcam_Scanner SHALL display an error message indicating detection failure and SHALL allow the User to retry or switch to manual input
6. WHEN Lottery_Numbers are extracted, THE System SHALL validate that the extracted data contains exactly 5 White_Ball_Numbers and exactly 1 Powerball_Number
7. IF extracted data does not contain exactly 5 White_Ball_Numbers and exactly 1 Powerball_Number, THEN THE System SHALL discard the extraction and SHALL continue detection attempts
8. WHEN valid Lottery_Numbers are extracted, THE System SHALL display them for User confirmation with White_Ball_Numbers and Powerball_Number clearly distinguished
9. WHEN the User requests to retry scanning, THE Webcam_Scanner SHALL clear the current extraction and SHALL resume detection
10. WHEN the User confirms extracted numbers, THE System SHALL proceed to historical analysis

### Requirement 3: Historical Results Analysis

**User Story:** As a User, I want to see if my Powerball numbers ever won, how close they came, and how frequently each number appeared in the past year, so that I can understand their historical performance.

#### Acceptance Criteria

1. WHEN Lottery_Numbers are confirmed, THE System SHALL query the Historical_Database for all drawings where at least one number from Lottery_Numbers matches the winning numbers
2. WHEN query results are retrieved, THE System SHALL identify exact matches where all Lottery_Numbers match all winning numbers in a drawing
3. WHEN query results are retrieved, THE System SHALL calculate the match count for each drawing showing how many White_Ball_Numbers matched the winning white balls and whether the Powerball_Number matched the winning Powerball
4. WHEN query results are retrieved, THE System SHALL identify the drawing with the highest match count as the closest the Lottery_Numbers came to winning
5. WHEN query results are retrieved, THE System SHALL identify the earliest and latest drawing dates analyzed from the Historical_Database
6. WHEN query results are retrieved, THE System SHALL calculate how often each White_Ball_Number from Lottery_Numbers appeared in winning drawings during the past year
7. WHEN query results are retrieved, THE System SHALL calculate how often the Powerball_Number from Lottery_Numbers appeared as the winning Powerball during the past year
8. WHEN query results are retrieved, THE System SHALL track White_Ball_Numbers frequency separately from Powerball_Number frequency
9. IF no matches are found, THEN THE System SHALL report that the numbers never won
10. WHEN query results are retrieved, THE System SHALL calculate statistics including total drawings checked and frequency distribution of match counts

### Requirement 4: Tombstone Display

**User Story:** As a User, I want to see my Powerball numbers displayed on a tombstone with their performance history and frequency statistics, so that I can visualize their fate in a memorable way.

#### Acceptance Criteria

1. WHEN historical analysis completes, THE System SHALL display a Tombstone graphic
2. THE Tombstone SHALL display the Lottery_Numbers at minimum 24pt font size or 150% of body text size, whichever is larger
3. THE Tombstone SHALL display an Epitaph summarizing the historical performance
4. THE Epitaph SHALL include whether the numbers ever won
5. THE Epitaph SHALL include the closest near-miss statistics
6. THE Epitaph SHALL include the date range of historical data analyzed
7. THE Epitaph SHALL include the frequency statistics for each White_Ball_Number and the Powerball_Number from the past year
8. THE Tombstone SHALL use grayscale color palette and serif typography
9. WHEN viewport width is 768px or greater, THE System SHALL render the Tombstone in vertical layout with minimum width of 400px
10. WHEN viewport width is less than 768px, THE System SHALL render the Tombstone in single-column layout fitting within viewport width minus 32px horizontal padding
11. THE Tombstone SHALL ensure all text content remains readable with minimum 14pt font size after responsive scaling
12. IF historical analysis returns no data, THEN THE System SHALL display error message indicating insufficient historical data and prevent Tombstone rendering

### Requirement 5: Tarot Reading Initiation

**User Story:** As a User, I want to be prompted to receive a tarot reading based on my Powerball numbers, so that I can explore mystical insights related to my numbers.

#### Acceptance Criteria

1. WHEN the Tombstone is displayed, THE System SHALL display a message prompting the User to receive a Tarot_Reading
2. WHEN the Tombstone is displayed, THE System SHALL display the Lottery_Numbers within the prompt
3. WHEN the Tombstone is displayed, THE System SHALL provide an accept control and a decline control for the Tarot_Reading prompt
4. WHEN the User activates the accept control, THE System SHALL display the question collection interface
5. WHEN the User activates the decline control, THE System SHALL display the number input interface
6. WHEN the Tombstone is displayed, THE System SHALL apply Rider_Waite_Style theming to the prompt interface

### Requirement 6: User Question Collection

**User Story:** As a User, I want to ask a question that's on my mind, so that the tarot reading can address my personal concerns.

#### Acceptance Criteria

1. WHEN the User initiates a Tarot_Reading, THE System SHALL prompt the User to enter a question
2. WHEN the User initiates a Tarot_Reading, THE System SHALL provide a text input field for the User's question
3. THE System SHALL accept questions up to 200 characters in length
4. WHEN the User submits a question, THE System SHALL validate that the question contains at least 1 non-whitespace character
5. IF the question is empty or contains only whitespace, THEN THE System SHALL display an error message indicating that a question is required
6. IF the question exceeds 200 characters, THEN THE System SHALL display an error message indicating the character limit
7. WHEN a question containing at least 1 non-whitespace character and not exceeding 200 characters is submitted, THE System SHALL proceed to card selection
8. WHEN the User submits a valid question, THE System SHALL retain the question text for display during the reading interpretation

### Requirement 7: Tarot Card Selection

**User Story:** As a User, I want tarot cards to be selected based on my Powerball numbers, so that the reading is connected to my original numbers.

#### Acceptance Criteria

1. WHEN a question containing 1 to 200 characters is submitted, THE System SHALL generate a three-card Tarot_Reading
2. WHEN generating a Tarot_Reading, THE System SHALL use the Lottery_Numbers as seed values to select cards from the 78-card tarot deck
3. WHEN the same Lottery_Numbers are used with the same question, THE System SHALL select the identical three cards in the same positions
4. WHEN selecting cards for a Tarot_Reading, THE System SHALL select three distinct cards where no card appears more than once in the reading
5. THE three cards SHALL represent past, present, and future positions respectively
6. WHEN displaying a Tarot_Reading, THE System SHALL display the selected tarot cards using Rider_Waite_Style imagery
7. WHEN displaying a Tarot_Reading, THE System SHALL display each card's name and position label alongside its imagery
8. IF Lottery_Numbers are not available when a question is submitted, THEN THE System SHALL display an error message indicating that lottery numbers must be generated before creating a tarot reading

### Requirement 8: Fortune Generation

**User Story:** As a User, I want to receive an AI-generated fortune based on my tarot cards and question, so that I can gain personalized mystical insights.

#### Acceptance Criteria

1. WHEN tarot cards are displayed to the User, THE System SHALL invoke the Fortune_Generator
2. THE Fortune_Generator SHALL receive the User's question (maximum 200 characters), the names of three selected cards, and their positions (past, present, future)
3. THE Fortune_Generator SHALL generate a Fortune within 30 seconds
4. THE Fortune SHALL contain at least 100 characters of text
5. THE Fortune SHALL mention the User's question topic
6. THE Fortune SHALL mention all three card names
7. THE Fortune SHALL mention the past, present, and future positions
8. WHEN the Fortune is generated, THE System SHALL display it to the User within 2 seconds
9. IF the Fortune_Generator does not respond within 30 seconds, THEN THE System SHALL display an error message indicating timeout and allow the User to retry
10. IF the Fortune_Generator returns an error response, THEN THE System SHALL display an error message indicating generation failure and allow the User to retry
11. THE System SHALL allow a maximum of 3 retry attempts per reading session
12. THE Fortune display SHALL use Rider_Waite_Style visual design

### Requirement 9: AWS Lambda Integration

**User Story:** As a system operator, I want fortune generation to run as an AWS Lambda function, so that the static site architecture remains intact while supporting AI features.

#### Acceptance Criteria

1. THE Fortune_Generator SHALL be implemented as an AWS Lambda function
2. WHEN the System invokes the Fortune_Generator, THE System SHALL send an HTTPS request containing question text, card identities, and card positions
3. THE Fortune_Generator SHALL accept requests where question text does not exceed 200 characters and card data includes exactly 3 card identities with corresponding positions
4. IF the Fortune_Generator receives a request where question text exceeds 200 characters or card data is incomplete, THEN THE Fortune_Generator SHALL reject the request with an error response indicating invalid input
5. WHEN the Fortune_Generator successfully generates a fortune, THE Fortune_Generator SHALL return a response containing the generated fortune text within 30 seconds
6. IF the Fortune_Generator does not respond within 30 seconds, THEN THE System SHALL terminate the request and display a timeout message indicating the fortune could not be generated
7. WHEN a timeout occurs, THE System SHALL provide a retry control that re-invokes the Fortune_Generator with the same input data
8. IF the Fortune_Generator encounters an error during generation, THEN THE Fortune_Generator SHALL return an error response indicating generation failure
9. IF the Fortune_Generator is unreachable or returns a network error, THEN THE System SHALL display an error message indicating the service is unavailable and provide a retry control

### Requirement 10: Responsive Design

**User Story:** As a User, I want the application to work on both desktop and mobile devices, so that I can use it on whatever device I have available.

#### Acceptance Criteria

1. WHEN System is rendered on desktop screen sizes (1024px width and above), THE System SHALL display all UI elements without horizontal scrolling
2. WHEN System is rendered on tablet screen sizes (768px to 1023px width), THE System SHALL display all UI elements without horizontal scrolling
3. WHEN System is rendered on mobile screen sizes (below 768px width), THE System SHALL display all UI elements without horizontal scrolling
4. THE System SHALL ensure all interactive elements have minimum touch target size of 44px by 44px on mobile and tablet devices
5. THE System SHALL display all text content at minimum 14px font size on mobile devices
6. WHEN screen orientation changes, THE System SHALL re-render layout within 1 second without loss of user input data
7. THE Webcam_Scanner SHALL enable user to select between front and rear cameras on mobile devices
8. WHEN user taps an interactive element on touch device, THE System SHALL respond with the same functional outcome as a mouse click on that element
9. THE System SHALL make all navigation controls accessible and functional on desktop, tablet, and mobile devices
10. THE System SHALL display Rider_Waite_Style visual elements (tarot card imagery and mystical aesthetics) on all device sizes without distortion or pixelation

### Requirement 11: Static Site Architecture

**User Story:** As a system operator, I want the application to function as a static website with historical data maintained via GitHub Action, so that it can be hosted simply and cost-effectively.

#### Acceptance Criteria

1. THE System SHALL deliver all user interface functionality through HTML, CSS, and JavaScript files without server-side rendering
2. THE System SHALL operate without backend server infrastructure except for HTTP requests to the Fortune_Generator
3. WHEN the System is deployed to standard HTTP hosting, THE System SHALL display the user interface and enable all features defined in Requirements 1-10
4. THE Historical_Database SHALL be stored as a flat file containing Powerball drawing results
5. THE Historical_Database SHALL be updated nightly via GitHub Action that fetches latest Powerball drawing results
6. THE System SHALL retrieve Historical_Database data via HTTP request to the flat file
7. IF Historical_Database data fails to load, THEN THE System SHALL display an error message indicating data unavailability and disable features requiring historical data
8. THE System SHALL load all CSS, JavaScript libraries, and static assets either from local files within the deployment or from CDN URLs
9. IF a CDN resource fails to load within 10 seconds, THEN THE System SHALL display an error message indicating resource unavailability
10. THE System SHALL cache Historical_Database data in browser storage to avoid redundant fetches within the same browsing session
11. THE System SHALL load and display the initial user interface within 5 seconds on a standard broadband connection

### Requirement 12: Visual Design Consistency

**User Story:** As a User, I want the entire application to use 1909 Rider-Waite art style, so that I have an immersive and cohesive mystical experience.

#### Acceptance Criteria

1. THE System SHALL apply Rider_Waite_Style visual design to all user interface screens
2. THE System SHALL display tarot cards using authentic 1909 Rider-Waite card images with aspect ratio preserved
3. WHEN rendering text content, THE System SHALL ensure minimum contrast ratio of 4.5:1 against background for readability
4. THE Tombstone SHALL incorporate Rider_Waite_Style decorative border elements
5. THE System SHALL maintain consistent visual treatment of Rider_Waite_Style ornamental elements across all screens
6. WHEN displayed on viewports smaller than 768 pixels wide, THE System SHALL scale Rider_Waite_Style decorative elements to remain fully visible
7. WHEN displayed on viewports smaller than 768 pixels wide, THE System SHALL ensure text remains legible at minimum font size of 14 pixels
