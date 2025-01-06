class QueryListings {
    listings = [];
    query = {};

    constructor(listings, query) {
        this.listings = listings;
        this.query = query;
    }

    categoryQuery = () => {
        this.listings = this.query.category 
            ? this.listings.filter(c => c.category === this.query.category) 
            : this.listings;
        return this;
    }

    ratingQuery = () => {
        if (this.query.rating) {
            const rating = parseInt(this.query.rating, 10);
            if (!isNaN(rating)) {
                this.listings = this.listings.filter(c => 
                    c.sellerId && c.sellerId.rating >= rating && c.sellerId.rating < rating + 1
                );
            }
        }
        return this;
    }

    priceQuery = () => {
        if (this.query.lowPrice !== undefined && this.query.highPrice !== undefined) {
            this.listings = this.listings.filter(p => 
                p.price >= this.query.lowPrice && p.price <= this.query.highPrice
            );
        }
        return this;
    }

    searchQuery = ()=>{
        this.listings = this.query.searchValue ? this.listings.filter(p => p.name.toUpperCase().indexOf(this.query.searchValue.toUpperCase()) > -1) : this.listings

        return this

    }

    yieldQuery = () => {
        // Ensure we filter listings based on the expectedHarvestYield range
        if (this.query.lowYield !== undefined && this.query.highYield !== undefined) {
            this.listings = this.listings.filter(p => 
                p.expectedHarvestYield >= this.query.lowYield && p.expectedHarvestYield <= this.query.highYield
            );
        }

        // Additionally, filter based on the selected yieldUnit if specified
        if (this.query.sortYieldUnit && this.query.sortYieldUnit !== 'all') {
            this.listings = this.listings.filter(p => 
                p.yieldUnit === this.query.sortYieldUnit
            );
        }

        return this;
    }

    sortByPrice = () => {
        if (this.query.sortPrice) {
            this.listings = this.listings.sort((a, b) => 
                this.query.sortPrice === 'low-to-high' 
                    ? a.price - b.price 
                    : b.price - a.price
            );
        }
        return this;
    }

    sortByYield = () => {
        if (this.query.sortYield) {
            this.listings = this.listings.sort((a, b) => 
                this.query.sortYield === 'low-to-high' 
                    ? a.expectedHarvestYield - b.expectedHarvestYield 
                    : b.expectedHarvestYield - a.expectedHarvestYield
            );
        }
        return this;
    }

    skip = () => {
        let { pageNumber } = this.query
        const skipPage = (parseInt(pageNumber) - 1) * this.query.parPage

        let skipListings = []

        for (let i = skipPage; i < this.listings.length; i++) {
            skipListings.push(this.listings[i])
        }
        this.listings = skipListings
        return this
    }
    // skip = () => {
    //     const pageNumber = parseInt(this.query.pageNumber) || 1;
    //     const perPage = parseInt(this.query.parPage) || this.listings.length;
    //     const skipPage = (pageNumber - 1) * perPage;

    //     this.listings = this.listings.slice(skipPage, skipPage + perPage);
    //     return this;
    // }
    limit = () => {
        let temp = []
        if (this.listings.length > this.query.parPage) {
            for (let i = 0; i < this.query.parPage; i++) {
                temp.push(this.listings[i])
            }
        } else {
            temp = this.listings
        }
        this.listings = temp

        return this
    }

    // limit = () => {
    //     const perPage = parseInt(this.query.parPage) || this.listings.length;
    //     this.listings = this.listings.slice(0, perPage);
    //     return this;
    // }

    getListings = () => {
        return this.listings;
    }

    countListings = () => {
        return this.listings.length;
    }
}

module.exports = QueryListings;
