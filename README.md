# Finance Market Daily Insights

This README provides an overview of the [**Finance Market Daily Insights**](https://xer0616.github.io/marketinsight/) webpage, a React-based application for presenting and analyzing daily market insights with a focus on sentiment analysis, keyword extraction, and data filtering.

---

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Data Structure](#data-structure)
5. [File Structure](#file-structure)
6. [Technologies Used](#technologies-used)
7. [Customization](#customization)

---

## Features

- **Data Visualization**: Displays financial statements with associated sentiment and keyword analysis.
- **Keyword Insights**: A bar chart highlighting the top 10 keywords based on their frequency.
- **Search Functionality**: Search through statements dynamically using keywords or text.
- **Filter Options**: 
  - Show flagged statements.
  - Filter by negative sentiment.
  - Display product-related statements.
  - Focus on linked statements.
- **Pagination**: Efficient navigation with customizable page sizes.
- **Statistics**: Quick overview of total statements and unique keywords.
- **Text-to-Speech**: Listen to the content with the browser's built-in speech synthesis API.
- **Keyword Cleaning**: Removes stop words, special symbols, and irrelevant data for clearer insights.

---

## Usage

1. **Search**:
   - Use the search bar to find specific statements by text or keywords.

2. **Filter**:
   - Toggle filters to view flagged, negative sentiment, or product-related statements.

3. **Navigate**:
   - Use pagination controls to browse through pages of insights.

4. **Keyword Insights**:
   - Analyze keyword trends through the bar chart visualization.

5. **Text-to-Speech**:
   - Click the sound icon to listen to a statement, and the stop button to cancel playback.

---

## Data Structure

The `data.json` file must be structured as an array of objects. Each object should include the following fields:

```json
[
  {
    "statement": "Sample financial market statement.",
    "company": "Company Name",
    "volume": 1000,
    "keywords": ["finance", "growth"],
    "sentiment": "positive",
    "category": "market",
    "linked": []
  }
]
```

### Field Details:
- `statement` (string): The main text of the market insight.
- `company` (string): The name of the company associated with the statement.
- `volume` (number): A numerical indicator such as trading volume.
- `keywords` (array of strings): Key phrases extracted from the statement.
- `sentiment` (string): Sentiment type (`positive`, `negative`, or `neutral`).
- `category` (string): The category of the statement (e.g., `market`, `product`).
- `linked` (array): List of related links or references.

---

## File Structure

```
src/
├── components/       # Reusable React components (optional)
├── data/
│   └── data.json     # Local data file
├── App.js            # Main application logic
├── App.css           # Custom styles
├── index.js          # Application entry point
└── ...
```

---

## Technologies Used

- **React**: Frontend framework for building the application.
- **Ant Design**: Modern UI components and styling.
- **Recharts**: For interactive bar chart visualizations.
- **Speech Synthesis API**: For text-to-speech functionality.
- **JavaScript**: Programming language for the application logic.

---

## Customization

- **Styling**: Update `App.css` to customize the appearance.
- **Data**: Replace or update `data.json` with new daily insights.
- **Components**: Modify or extend components to add functionality.
- **Keyword Cleaning**: Edit the `stopWords` set in `App.js` to refine keyword extraction.

---

## Future Enhancements

- Real-time data fetching from APIs for daily updates.
- Advanced sentiment analysis using AI models.
- Dashboard customization with additional charts and insights.
- Multi-language support for global market analysis.

---

Explore the **Finance Market Daily Insights** webpage to stay informed about daily market trends and sentiment. 🎉
