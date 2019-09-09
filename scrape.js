const puppeteer = require("puppeteer");

let url = "https://www.airbnb.com/s/Chicago/homes?refinement_paths%5B%5D=%2Fhomes&click_referer=t%3ASEE_ALL%7Csid%3A3da1c583-2242-4db8-94bc-03ea8ccc82a3%7Cst%3AMAGAZINE_HOMES&query=Chicago&search_type=unknown&zoom=11&search_by_map=true&sw_lat=41.79343202132374&sw_lng=-87.83157628173825&ne_lat=41.94120907198003&ne_lng=-87.48207371826169&place_id=ChIJ7cv00DwsDogRAMDACa2m4K8&s_tag=pTqyE4zD" //The pages url

async function scraper() {
	let browser, page, data;
	try {
	    console.log("Opening the browser......");
	    browser = await puppeteer.launch({ 
	        headless: false,
	        args: ["--no-sandbox", "--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true
	    });
	} catch (err) {
	    console.log("Couldn't open a new browser instance : ", err);
	}
	try{
		page = await browser.newPage();
	}
	catch(err){
		console.log("There was an error opening the new browser page : ", err);
	}
	try {
        console.log("navigating to the url");
        await page.goto(url, {
            waitUntil: "domcontentloaded"
        });
        await page.waitFor('._fhph4u'); // make sure the data in this fields is loaded before proceeding
        await page.waitFor(2000); //wait for 2seconds to be sure all data is loaded
    } catch (err) {
        console.log(`${url} => ${err}`);
    }

	function ev(){
		//This function clicks the button that loads the next page on the site
		return page.evaluate(() => {
			let next = document.querySelectorAll('._1m76pmy')[1];
			console.log("The next is ", next);
			next.click();
		})
	}
	let pagesData = [];
	// for (let i = 0; i < 1; i++){ //Change the range of values to loop over to change the number of pages scraped
	    try{
	    	function scrapePages(){
		    	data = page.evaluate(async () => {
		    		let hotelsContainer = document.querySelectorAll('._fhph4u');
		    		let dataArr = [];
		    		//convert the nodelist into an array of nodeLists
		    		hotelsContainer = Array.from(hotelsContainer);
		    		hotelsContainer.forEach(hotelCon => {
		    			let hotelBody = hotelCon.querySelectorAll('span._qlq27g a');
		    			// convert to an array of nodelists
		    			hotelBody = Array.from(hotelBody);
		    			hotelBody.forEach(hotel => {
				    		let data = {};
				    		let listing = hotel.target.split('_')[1];
				    		let type = hotel.querySelector('._1xxanas2').textContent;
				    		let name = hotel.querySelector('._1dss1omb').textContent;
				    		let pricePerNight = hotel.querySelector('._1p3joamp').textContent.split(':')[1].split('/')[0]; 
				    		// console.log("hotel listing is ", listing);
				    		// console.log("hotel name is ", pricePerNight);
				    		data.name = name;
				    		data.type = type;
				    		data.pricePerNight = pricePerNight;
				    		data.id = listing;
				    		dataArr.push(data);
		    			});
		    		});
		    		console.log("The data is ", dataArr);
		    		return dataArr;
		    	})
		    	// console.log('The Data is ', data);
		    	return data;
	    	}
	    	let waiter = new Promise((resolve, reject) => {
	    		//This is juat a script that causes a delay of 5 seconds
	    		setTimeout(() => {
	    			resolve(true)
	    		}, 10000)
	    	})
	    }
	    catch(err){
	    	console.log(`Could not evaluate the page => ${err}`)
	    	ev();
	    }
	    let waiter = new Promise((resolve, reject) => {
			//This is juat a script that causes a delay of 5 seconds
			setTimeout(() => {
				resolve(true)
			}, 10000)
		})
		// let scrapedData = await scrapePages();
		// pagesData.push(scrapedData);
		let containers = await page.$$eval('div._gig1e7 > div > meta:nth-child(3)', divs => {
			divs = divs.map(div => div.getAttribute('content')); //Get all links of listed hotelsa and places in one array
			return divs;
		});
		//Open each of this links in an enitirely new page and scrape data off of them
		async function scrapeNewpage(url){
			let newPage = await browser.newPage();
			newPage.setViewport({height:800, width:500});
			console.log("The containers are ", containers[0]);
			await newPage.goto(`https://${url}`, {
	            waitUntil: "domcontentloaded"
	        });
			await newPage.waitFor('._1svux14');
			let clickNumber = {
				'January' : 11,
				'February' : 10,
				'March' : 9,
				'April' : 8,
				'May' : 7,
				'June' : 6,
				'July' : 5,
				'August' : 4,
				'September' : 3,
				'October' : 2,
				'November' : 1,
				'December' : 0
			}
			let month = await newPage.$eval('._gucugi > strong', text => text.textContent);
			month = month.split(' ')[0];
			let monthIndex = clickNumber[month];
			let waitAWhile = new Promise((resolve, reject) => {
				//This is juat a script that causes a delay of 5 seconds
				setTimeout(() => {
					resolve(true)
				},5000)
			})
			let table;
			async function getAvailability(){
				// table = newPage.$eval('._754zdu7 > ._fdp53bg > ._1svux14 > ._p5jgym > tbody', rows => {
				// 	console.log("The rows are ", rows);
				// });
				table = await newPage.evaluate(async () => {
					let dateCon = document.querySelector('._754zdu7 > ._fdp53bg > ._1svux14 > ._p5jgym > tbody');
					// console.log("The date Con is ", dateCon);
					let dateConRow1 = dateCon.querySelectorAll('tr')[0].querySelectorAll('td');
					//for row 1
					// console.log("Row 1 is ", dateConRow1);
					let dateConRow2 = dateCon.querySelectorAll('tr')[3].querySelectorAll('td');
					console.log('They are ', dateCon.querySelectorAll('._12fun97'))
					let row2Day1 = dateConRow2[0].innerHTMl === "" ? 0 : dateConRow2[0].classList.contains('_12fun97') ? dateConRow2[0].textContent : dateConRow2[0].classList;
					let row2Day2 = dateConRow2[1].innerHTMl === "" ? 0 : dateConRow2[1].classList.contains('_12fun97') ? dateConRow2[1].textContent : dateConRow2[1].classList;
					console.log("R is ", dateConRow2);
					console.log("Row 1 is ", row2Day1);
					console.log("Row 2 is ", row2Day2);
					// let dateConRow3 = dateCon.querySelectorAll('tr')[2].querySelectorAll('td');
					// let dateConRow4 = dateCon.querySelectorAll('tr')[3].querySelectorAll('td');
					// let dateConRow5 = dateCon.querySelectorAll('tr')[4].querySelectorAll('td');
				});
			}
			// for(let i = 0; i < monthIndex; i++){
				getAvailability();
				await waitAWhile;
				// await newPage.click('._1h5uiygl'); //rgb(237, 246, 246)
			// }
		}
		scrapeNewpage(containers[1]);

		// if(i < 1){
	 //    	page.click('._1m76pmy');
		// }
		// else{
		// 	ev();
		// }
		await waiter; // wait for 5 seconds so the data on the next page can be rendered before scraping it;
	// }
	console.log(pagesData)

}

module.exports = scraper;