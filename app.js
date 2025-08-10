"use strict";

(async () => {
    const getData = url => fetch(url).then(response => response.json());

    const userInput = document.getElementById('search-area');
    const searchForm = document.getElementById('search-form');
    const allBtn = document.getElementById('all-btn');
    const statsDiv = document.getElementById('stats');
    const errorDiv = document.getElementById('error');

    const showError = (message) => {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    };

    const renderResultsAll = async () => {
        try {
            const allData = await getData('https://restcountries.com/v3.1/all?fields=name,population,currencies,region');

            const totalCountries = allData.length;
            let totalPopulation = allData.reduce((sum, c) => sum + (Number(c.population) || 0), 0);
            const avgPopulation = Math.round(totalPopulation / totalCountries);

            const regionData = {};
            allData.forEach(country => {
                const region = country.region || 'Unknown';
                if (!regionData[region]) {
                    regionData[region] = { count: 0, population: 0 };
                }
                regionData[region].count += 1;
                regionData[region].population += Number(country.population) || 0;
            });

            let resultsHTML = `
                <div><strong>Total countries result: </strong>${totalCountries.toLocaleString()}</div>
                <div><strong>Total Countries Population: </strong>${totalPopulation.toLocaleString()}</div>
                <div><strong>Average Population: </strong>${avgPopulation.toLocaleString()}</div>
                <br>
                <table>
                    <thead>
                        <tr>
                            <th>Country Name</th>
                            <th>Total Population</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            resultsHTML += allData
                .map(country => {
                    const countryName = country.name?.common || 'Unknown';
                    const population = country.population ? Number(country.population) : 0;

                    return `
                        <tr>
                            <td>${countryName}</td>
                            <td>${population.toLocaleString()}</td>
                        </tr>
                    `;
                }).join('');

            resultsHTML += `
                    </tbody>
                </table>
                <br>
                <table>
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Number of countries</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            resultsHTML += Object.entries(regionData)
                .map(([region, data]) => `
                    <tr>
                        <td>${region}</td>
                        <td>${data.count}</td>
                    </tr>
                `).join('');

            resultsHTML += `
                    </tbody>
                </table>
            `;

            statsDiv.innerHTML = resultsHTML;
        } catch (err) {
            showError('Error fetching all countries data: ' + err.message);
        }
    };

    const renderSearchResults = async (searchTerm) => {
        if (!searchTerm.trim()) {
            showError('Please enter a country name');
            return;
        }

        try {
            const searchData = await getData(`https://restcountries.com/v3.1/name/${encodeURIComponent(searchTerm.trim())}`);

            if (searchData.length === 0) {
                showError('No countries found matching your search');
                return;
            }

            const totalCountries = searchData.length;
            let totalPopulation = searchData.reduce((sum, c) => sum + (Number(c.population) || 0), 0);
            const avgPopulation = Math.round(totalPopulation / totalCountries);

            let resultsHTML = `
                <div><strong>Total countries result: </strong>${totalCountries}</div>
                <div><strong>Total Countries Population: </strong>${totalPopulation.toLocaleString()}</div>
                <div><strong>Average Population: </strong>${avgPopulation.toLocaleString()}</div>
                <br>
                <table>
                    <thead>
                        <tr>
                            <th>Country Name</th>
                            <th>Total Population</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            resultsHTML += searchData
                .map(country => {
                    const countryName = country.name?.common || 'Unknown';
                    const population = country.population ? Number(country.population) : 0;

                    return `
                        <tr>
                            <td>${countryName}</td>
                            <td>${population.toLocaleString()}</td>
                        </tr>
                    `;
                }).join('');

            resultsHTML += `
                    </tbody>
                </table>
                <br>
                <table>
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Number of countries</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            const regionCount = {};
            searchData.forEach(country => {
                const region = country.region || 'Unknown';
                regionCount[region] = (regionCount[region] || 0) + 1;
            });

            resultsHTML += Object.entries(regionCount)
                .map(([region, count]) => `
                    <tr>
                        <td>${region}</td>
                        <td>${count}</td>
                    </tr>
                `).join('');

            resultsHTML += `
                    </tbody>
                </table>
            `;

            statsDiv.innerHTML = resultsHTML;

        } catch (err) {
            if (err.message.includes('404') || err.message.includes('Not Found')) {
                showError('Country not found. Please check the spelling and try again.');
            } else {
                showError('Error searching for country: ' + err.message);
            }
        }
    };

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        renderSearchResults(userInput.value);
    });

    allBtn.addEventListener('click', (e) => {
        e.preventDefault();
        renderResultsAll();
    });

    document.getElementById('search-btn').addEventListener('click', (e) => {
        e.preventDefault();
        renderSearchResults(userInput.value);
    });

    document.addEventListener('DOMContentLoaded', () => {
        statsDiv.innerHTML = '<p>Use the search form above to find countries or click "All Countries" to see global statistics.</p>';
    });

})();