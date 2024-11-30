// src/App.js
import React, { useEffect, useState, useCallback } from 'react';
import { List, Pagination, Input, Tag, Card, Row, Col, Checkbox, Button, Statistic, Avatar, Tooltip } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { SoundOutlined, CloseOutlined, FlagOutlined, StockOutlined } from '@ant-design/icons';
import 'antd/dist/reset.css'; // For Ant Design styling
import './App.css'; // Optional: For custom styles

// Import local data
import jsonData from './data/data.json';

const stopWords = new Set([
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves",
    "you", "your", "yours", "yourself", "yourselves", "he", "him",
    "his", "himself", "she", "her", "hers", "herself", "it", "its",
    "itself", "they", "them", "their", "theirs", "themselves", "what",
    "which", "who", "whom", "this", "that", "these", "those", "am",
    "is", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "having", "do", "does", "did", "doing", "a", "an", "the",
    "and", "but", "if", "or", "because", "as", "until", "while", "of",
    "at", "by", "for", "with", "about", "against", "between", "into",
    "through", "during", "before", "after", "above", "below", "to",
    "from", "up", "down", "in", "out", "on", "off", "over", "under",
    "again", "further", "then", "once", "here", "there", "when", "where",
    "why", "how", "all", "any", "both", "each", "few", "more", "most",
    "other", "some", "such", "no", "nor", "not", "only", "own", "same",
    "so", "than", "too", "very", "s", "t", "can", "will", "just",
    "don", "should", "now", "earnings", "stock", "revenue", "growth",
    "company", "stock price", "services", "analysts", "solutions",
    "technology", "price", "products", "investment", "global",
    "shares", "business", "innovation", "market", "dividend",
    "data", "news", "analytics", "market", "dividend",
    "estimates", "financial", "corporation"
]);

const cleanKeywords = (keywords) => {
    const outKeywords = keywords
        .map(keyword => keyword.toLowerCase().trim())
        .map(keyword => keyword.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ''))
        .filter(keyword => keyword && !stopWords.has(keyword) && !/^\d+$/.test(keyword) && keyword.length > 3);
    return outKeywords;
};

const readOutLoud = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
};

const stopReading = () => {
    speechSynthesis.cancel();
};

function App() {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sizeOption] = useState([1, 3, 5, 10, 20]);
    const [pageSize, setPageSize] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showTopKeywordsOnly, setShowTopKeywordsOnly] = useState(false);
    const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
    const [showNegativeSentimentOnly, setShowNegativeSentimentOnly] = useState(false);
    const [hideStatementsWithoutKeywords, setHideStatementsWithoutKeywords] = useState(false);
    const [showProductCategoryOnly, setShowProductCategoryOnly] = useState(false);
    const [showLinkedOnly, setShowLinkedOnly] = useState(false);

    useEffect(() => {
        // Load data from the local file
        const cleanedData = jsonData.map((item) => ({
            ...item,
            keywords: cleanKeywords(item.keywords),
            flagged: false,
        }));
        cleanedData.sort((a, b) => b.volume - a.volume);
        setData(cleanedData);
    }, []);

    // Function to filter data based on search criteria
    const getFilteredData =  useCallback(() => {
        return data.filter(item => {
            const matchesSearch = item.statement ? item.statement.toLowerCase().includes(searchTerm.toLowerCase()) : 'Empty';
            const matchesFlagged = !showFlaggedOnly || item.flagged;
            const matchesSentiment = !showNegativeSentimentOnly || item.sentiment === 'negative';
            const matchesProductCategory = !showProductCategoryOnly || item.category === 'product';
            const matchesLinked = !showLinkedOnly || item.linked.length > 0 ;
            return matchesSearch && matchesFlagged && matchesSentiment && matchesProductCategory && matchesLinked;
        });
    }, [data, searchTerm, showFlaggedOnly, showLinkedOnly, showNegativeSentimentOnly, showProductCategoryOnly]);

    // Function to handle the Delete key press
    const handleDeleteKeyPress = useCallback((event) => {
        if (event.key === 'Delete') {
            const filteredData = getFilteredData();
            const currentIndex = (currentPage - 1) * pageSize;

            if (filteredData.length > 0 && currentIndex < filteredData.length) {
                const statementToDelete = filteredData[currentIndex];

                // Remove the statement from the main data
                const updatedData = data.filter(item => item !== statementToDelete);
                setData(updatedData);

                // Check if the filtered data is now empty
                const newFilteredData = getFilteredData();
                if (newFilteredData.length === 0 && searchTerm === '') {
                    // If search term is cleared and no more items, reset to show all data
                    setCurrentPage(1);
                } else if (newFilteredData.length === 0) {
                    // If search term is active but no items left, reset search filters
                    setSearchTerm('');
                    setShowFlaggedOnly(false);
                    setShowNegativeSentimentOnly(false);
                } else {
                    // Adjust pagination if the current page exceeds available pages
                    if (currentPage > Math.ceil(updatedData.length / pageSize)) {
                        setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
                    }
                }
            }
        }
    },[currentPage, data, getFilteredData, pageSize, searchTerm]);

    useEffect(() => {
        // Attach the event listener for the "Delete" key
        window.addEventListener('keydown', handleDeleteKeyPress);
        return () => {
            // Clean up the event listener
            window.removeEventListener('keydown', handleDeleteKeyPress);
        };
    }, [currentPage, pageSize, data, searchTerm, showFlaggedOnly, showNegativeSentimentOnly, handleDeleteKeyPress]);

    // Update search term on key press
    const handleSearchKeyUp = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleDelete = (itemToDelete) => {
        const updatedData = data.filter(item => item !== itemToDelete);
        setData(updatedData);
    };

    const filteredData = getFilteredData();

    const keywordCounts = {};
    data.forEach(item => {
        item.keywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
    });

    const sortedKeywords = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([keyword]) => keyword);

    const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleScroll = useCallback((event) => {
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 1 && event.deltaY > 0) {
            if (currentPage < Math.ceil(filteredData.length / pageSize)) {
                setCurrentPage(prevPage => Math.min(prevPage + 1, Math.ceil(filteredData.length / pageSize)));
            }
        }
        else if (scrollTop === 0 && event.deltaY < 0) {
            if (currentPage > 1) {
                setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
            }
        }
    }, [currentPage, filteredData.length, pageSize]);

    useEffect(() => {
        window.addEventListener('wheel', handleScroll);
        return () => {
            window.removeEventListener('wheel', handleScroll);
        };
    }, [currentPage, filteredData.length, pageSize, handleScroll]);

    const totalStatements = data.length;

    return (
        <div className="App" style={{ padding: '20px' }}>
            <h1>Finance Market Daily Insights</h1>
            <Input.Search
                placeholder="Search statements..."
                onChange={handleSearchKeyUp} // Update the search term on each key press
                style={{ marginBottom: '20px' }}
                value={searchTerm}
            />
            <Row gutter={16}>
                <Col span={7}>
                    <Row gutter={16}>
                        <Col span={11}>
                            <Card title="Total Statements" bordered={false}>
                                <Statistic value={totalStatements} />
                            </Card>
                        </Col>
                        <Col span={11}>
                            <Card title="Unique Keywords" bordered={false}>
                                <Statistic value={Object.keys(keywordCounts).length} />
                            </Card>
                        </Col>
                    </Row>

                    <h3>Top 10 Keywords Frequency</h3>
                    <BarChart
                        width={400}
                        height={200}
                        data={sortedKeywords.map(keyword => ({ name: keyword, value: keywordCounts[keyword] }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        style={{ marginBottom: '10px' }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip/>
                        <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                    <Checkbox
                        checked={showTopKeywordsOnly}
                        onChange={(e) => {
                            setShowTopKeywordsOnly(e.target.checked);
                            setCurrentPage(1);
                        }}
                        style={{ marginBottom: '30px' }}
                    >
                        Show only top keywords
                    </Checkbox>
                    <Checkbox
                        checked={showFlaggedOnly}
                        onChange={(e) => {
                            setShowFlaggedOnly(e.target.checked);
                            setCurrentPage(1);
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        Show flagged statements only
                    </Checkbox>
                    <Checkbox
                        checked={showNegativeSentimentOnly}
                        onChange={(e) => {
                            setShowNegativeSentimentOnly(e.target.checked);
                            setCurrentPage(1);
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        Show negative sentiment only
                    </Checkbox>
                    <Checkbox
                        checked={hideStatementsWithoutKeywords}
                        onChange={(e) => {
                            setHideStatementsWithoutKeywords(e.target.checked);
                            setCurrentPage(1);
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        Hide statements without keywords
                    </Checkbox>
                    <Checkbox
                        checked={showProductCategoryOnly}
                        onChange={(e) => {
                            setShowProductCategoryOnly(e.target.checked);
                            setCurrentPage(1);
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        Show "Product" Category Only
                    </Checkbox>
                    <Checkbox
                        checked={showLinkedOnly}
                        onChange={(e) => {
                            setShowLinkedOnly(e.target.checked);
                            setCurrentPage(1);
                        }}
                        style={{ marginBottom: '20px' }}
                    >
                        Show linked Only
                    </Checkbox>
                </Col>

                <Col span={17}>
                    <Pagination
                        current={currentPage}
                        total={filteredData.length}
                        pageSize={pageSize}
                        onChange={(page) => setCurrentPage(page)}
                        onShowSizeChange={(_, size) => setPageSize(size)}
                        showSizeChanger
                        pageSizeOptions={sizeOption}
                    />
                    <List
                        itemLayout="vertical"
                        dataSource={paginatedData}
                        renderItem={(item) => (
                            <List.Item
                                style={{ marginBottom: '12px' }}
                                actions={[
                                    <Tooltip title="Read the statement aloud">
                                        <Button
                                            type="primary"
                                            icon={<SoundOutlined />}
                                            onClick={() => readOutLoud(item.statement)}
                                        />
                                    </Tooltip>,
                        
                                    <Tooltip title="Stop the text-to-speech playback">
                                        <Button
                                            icon={<CloseOutlined />}
                                            onClick={() => stopReading()}
                                        />
                                    </Tooltip>,
                        
                                    <Tooltip title={item.flagged ? "Unflag this statement" : "Flag this statement"}>
                                        <Button
                                            type={item.flagged ? "danger" : "default"}
                                            icon={<FlagOutlined />}
                                            onClick={() => {
                                                item.flagged = !item.flagged;
                                                setData([...data]);
                                            }}
                                        />
                                    </Tooltip>,
                        
                                    <Tooltip title="Delete this statement">
                                        <Button
                                            type="danger"
                                            icon={<CloseOutlined />}
                                            onClick={() => handleDelete(item)}
                                        >
                                            Delete
                                        </Button>
                                    </Tooltip>
                                ]}
                            >
                                    <Card
                                        title={<Avatar style={{ backgroundColor: '#87d068' }}>{item.symbol}</Avatar>}
                                        extra={
                                            <a href={`https://www.google.ca/search?q=${item.company.replace(' ', '+')}+stock`}>
                                                {item.company}
                                            </a>
                                        }
                                        bordered={true}
                                        hoverable
                                        style={{ borderRadius: '10px' }}
                                    >
                                    <Row gutter={16}>
                                        <Col span={18}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                                                <span style={{ color:'grey', fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                    {item.update} -
                                                </span>
                                                - {item.statement}
                                            </div>
                                            <div>
                                              {item.linked.map((link, index) => (
                                                <span>
                                                  <span style={{ color: 'blue', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                  <a href={`https://www.google.ca/search?q=${link.split(':')[0].replace(' ', '+')}+stock`}>{link.split(':')[0]}:</a>
                                                  </span>
                                                  <span style={{ color: 'blue', fontSize: '15px', marginBottom: '4px' }}>{link.split(':')[1]}</span><br/>
                                                </span>
                                              ))}
                                            </div>
                                            <div style={{ marginBottom: '12px' }}>
                                                {item.sentiment === 'positive' && <Tag color="green">Positive</Tag>}
                                                {item.sentiment === 'neutral' && <Tag color="grey">Neutral</Tag>}
                                                {item.sentiment === 'negative' && <Tag color="red">Negative</Tag>}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                                {item.keywords.map(keyword => (
                                                    <Tag
                                                        key={keyword}
                                                        color={sortedKeywords.includes(keyword) ? 'blue' : 'default'}
                                                    >
                                                        {keyword}
                                                    </Tag>
                                                ))}
                                            </div>
                                        </Col>
                                        <Col span={6} style={{ textAlign: 'center' }}>
                                            <Statistic
                                                title="Current Price"
                                                value={item.current || 'N/A'}
                                                prefix={<StockOutlined />}
                                            />
                                            <div style={{ color:'grey', fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                                                Volume : {item.volume}
                                            </div>
                                            <div style={{ color:'blue', fontSize: '14px', marginBottom: '4px' }}>
                                                {item.introduction}
                                            </div>
                                            <LineChart
                                                width={120}
                                                height={70}
                                                data={item.stockTrend || []}
                                                style={{ marginTop: '12px' }}
                                            >
                                                <XAxis dataKey="date" hide />
                                                <YAxis hide />
                                                <RechartsTooltip/>
                                                <Line type="monotone" dataKey="value" stroke="#8884d8" />
                                            </LineChart>
                                        </Col>
                                    </Row>
                                </Card>
                            </List.Item>
                        )}
                    />
                </Col>
            </Row>
        </div>
    );
}

export default App;


