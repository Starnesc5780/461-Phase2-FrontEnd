
import axios from 'axios';

const apiBaseUrl = "http://ec2-3-144-8-160.us-east-2.compute.amazonaws.com:3000";
// const apiBaseUrl = "http://localhost:3000";
const searchButton = document.getElementById('search-btn') as HTMLButtonElement;
const uploadButton = document.getElementById('upload-btn') as HTMLButtonElement;
const updateButton = document.getElementById('update-btn') as HTMLButtonElement;
const rateButton = document.getElementById('rate-btn') as HTMLButtonElement;
const costButton = document.getElementById('cost-btn') as HTMLButtonElement;
const getButton = document.getElementById('get-btn') as HTMLButtonElement;
const submitButton = document.getElementById('submit-btn') as HTMLButtonElement;

const dynamicInput = document.getElementById('dynamic-input') as HTMLInputElement;
const responseOutput = document.getElementById('response-output') as HTMLPreElement;

const inputSection = document.getElementById('input-section') as HTMLElement;

let currentEndpoint: string | null = null;

// function displaySearchResults(searchResults: any) {
//     const contentSection = document.querySelector('.content-section') as HTMLElement;

//     // Clear previous content
//     contentSection.innerHTML = '';

//     // Add heading
//     const heading = document.createElement('h2');
//     heading.textContent = `Search Results`;
//     contentSection.appendChild(heading);

//     // Add search results
//     if (searchResults.length === 0) {
//         contentSection.innerHTML += `<p>No packages found.</p>`;
//     } else {
//         // Create a container for the packages
//         const packageContainer = document.createElement('div');
//         packageContainer.className = 'package-container';

//         searchResults.forEach((pkg: { Name: string; Version: string; ID: string }) => {
//             const packageBox = document.createElement('div');
//             packageBox.className = 'package-box';

//             packageBox.innerHTML = `<p><strong>Name:</strong> ${pkg.Name}</p>
//                                     <p><strong>Version:</strong> ${pkg.Version}</p>
//                                     <p><strong>ID:</strong> ${pkg.ID}</p>`;

//             packageContainer.appendChild(packageBox);
//         });

//         contentSection.appendChild(packageContainer);
//     }
// }

function displayResponse(data: any) {
    const responseSection = document.getElementById('response-output');
    if (!responseSection) 
        return;
    responseSection.innerHTML = '';

    if (Array.isArray(data)) {
        //display as table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';

        const headers = Object.keys(data[0] || {}).filter(key => key !== '_id');
        const headerRow = document.createElement('tr');
        headers.forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.border = '1px solid #ccc';
            th.style.padding = '8px';
            th.style.backgroundColor = '#f4f4f4';
            th.style.textAlign = 'left';
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        //table rows
        data.forEach((item) => {
            const row = document.createElement('tr');
            headers.forEach((header) => {
                const cell = document.createElement('td');
                cell.textContent = item[header] || 'N/A';
                cell.style.border = '1px solid #ccc';
                cell.style.padding = '8px';
                row.appendChild(cell);
            });
            table.appendChild(row);
        });

        responseSection.appendChild(table);
    } else if (typeof data === 'object') {
        //display as list
        const list = document.createElement('ul');
        list.style.listStyleType = 'none';
        list.style.padding = '0';

        Object.entries(data).forEach(([key, value]) => {
            const listItem = document.createElement('li');
            listItem.style.marginBottom = '8px';

            const keySpan = document.createElement('strong');
            keySpan.textContent = `${key}: `;
            listItem.appendChild(keySpan);

            const valueSpan = document.createElement('span');
            valueSpan.textContent = typeof value === 'object' ? JSON.stringify(value, null, 2) : (value ?? 'N/A').toString();
            listItem.appendChild(valueSpan);

            list.appendChild(listItem);
        });

        responseSection.appendChild(list);
    } else {
        //display directly
        responseSection.textContent = data.toString();
    }
}


function resetInputField() {
    dynamicInput.value = "";
    inputSection.style.display = "block";
}

// Event handlers for buttons

searchButton.addEventListener('click', async () => {
    const query = (document.getElementById('search-input') as HTMLInputElement).value;
    try {
        const response = await axios.post(apiBaseUrl + '/package/byRegEx', { RegEx: query });
        displayResponse(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const err = error as any;
            displayResponse(err.response?.data || err.message);
        } else {
            displayResponse(error);
        }
    }
});

// searchButton.addEventListener('click', async () => {
//     const query = (document.getElementById('search-input') as HTMLInputElement).value;
//     try {
//         const response = await axios.post(`${apiBaseUrl}/package/byRegEx`, { RegEx: query });
//         displaySearchResults(response.data); // Use the new function to display results
//     } catch (error) {
//         const contentSection = document.querySelector('.content-section') as HTMLElement;
//         const err = error as any;
//         contentSection.innerHTML = `<p>Error: ${err.response?.data || err.message}</p>`;
//     }
// });

uploadButton.addEventListener('click', () => {
    currentEndpoint = '/package';
    resetInputField();
});

updateButton.addEventListener('click', () => {
    currentEndpoint = '/package/{id}';
    resetInputField();
});

rateButton.addEventListener('click', () => {
    currentEndpoint = '/package/{id}/rate';
    resetInputField();
});

costButton.addEventListener('click', () => {
    currentEndpoint = '/package/{id}/cost';
    resetInputField();
});

getButton.addEventListener('click', () => {
    currentEndpoint = '/packages';
    resetInputField();
});

submitButton.addEventListener('click', async () => {
    if (!currentEndpoint) return;
    const input = dynamicInput.value;
    try {
        let response;
        if (currentEndpoint.includes('{id}')) {
            response = await axios.get(`${apiBaseUrl}${currentEndpoint.replace('{id}', input)}`);
        } else {
            response = await axios.post(`${apiBaseUrl}${currentEndpoint}`, { input });
        }
        displayResponse(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 404) {
                displayResponse('Error 404: Package not found.');
            }
            else if (error.response?.status === 400) {
                displayResponse('Error 400: There is missing field(s) in the PackageID');
            }
            else {
                displayResponse('Error 500: The package rating system choken on at least one of the metrics.');
            }
        } else {
            displayResponse(String(error));
        }
    }
});
