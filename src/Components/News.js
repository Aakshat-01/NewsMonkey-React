import React, { Component } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

export default class News extends Component {
  static defaultProps = {
    country: "in",
    pageSize: 8,
    category: "general",
  };

  static propTypes = {
    country: PropTypes.string,
    pageSize: PropTypes.number,
    category: PropTypes.string,
  };

  capitalizeFirstLetter = (val) => {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
  };

  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      loading: true,
      page: 1,
      totalArticles: 0,
      hasMore: true,
      hasFetchedOnce: false,
    };
    document.title = `${this.capitalizeFirstLetter(
      this.props.category
    )} - NewsMonkey`;
  }

  async updateNews() {
    try {
      // Prevent double fetch in StrictMode
      if (this.state.hasFetchedOnce) return;
      this.setState({ loading: true, hasFetchedOnce: true });

      this.props.setProgress(10);

      const url = `https://gnews.io/api/v4/top-headlines?country=${this.props.country}&lang=en&category=${this.props.category}&max=${this.props.pageSize}&page=${this.state.page}&apikey=${this.props.apiKey}`;
      let data = await fetch(url);

      this.props.setProgress(30);
      let parsedData = await data.json();
      this.props.setProgress(70);

      const articles = parsedData.articles || [];

      this.setState({
        articles: articles,
        totalArticles: parsedData.totalArticles || 0,
        loading: false,
        hasMore: articles.length >= this.props.pageSize,
      });

      this.props.setProgress(100);
    } catch (error) {
      console.error("Error fetching news:", error);
      this.setState({ loading: false, articles: [], hasMore: false });
      this.props.setProgress(100);
    }
  }

  componentDidMount() {
    this.updateNews();
  }

  fetchMoreData = async () => {
    try {
      let nextPage = this.state.page + 1;
      this.setState({ loading: true });

      const url = `https://gnews.io/api/v4/top-headlines?country=${this.props.country}&lang=en&category=${this.props.category}&max=${this.props.pageSize}&page=${nextPage}&apikey=${this.props.apiKey}`;
      let data = await fetch(url);
      let parsedData = await data.json();

      const articles = parsedData.articles || [];
      const noMoreData = articles.length < this.props.pageSize;

      this.setState((prevState) => ({
        articles: prevState.articles.concat(articles),
        page: nextPage,
        loading: false,
        hasMore: !noMoreData,
      }));
    } catch (error) {
      console.error("Error loading more news:", error);
      this.setState({ loading: false, hasMore: false });
    }
  };

  render() {
    return (
      <>
        <h1 className="text-center" style={{ margin: "60px 0px" }} >
          NewsMonkey - Top {this.capitalizeFirstLetter(this.props.category)} Headlines
        </h1>

        <InfiniteScroll
          dataLength={this.state.articles.length}
          next={this.fetchMoreData}
          hasMore={this.state.hasMore}
          loader={this.state.loading ? <Spinner /> : null} // unified loader
        >
          <div className="container">
            <div className="row">
              {this.state.articles.map((element, index) => {
                return (
                  <div className="col-md-4" key={element.url || index}>
                    <NewsItem
                      title={element.title ? element.title.slice(0, 50) : ""}
                      description={
                        element.description
                          ? element.description.slice(0, 88)
                          : ""
                      }
                      imageUrl={
                        element.image ||
                        "https://via.placeholder.com/400x200?text=No+Image"
                      }
                      newsUrl={element.url}
                      author={element.author || "Unknown"}
                      date={element.publishedAt}
                      source={element.source?.name || "Unknown"}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </InfiniteScroll>
      </>
    );
  }
}
