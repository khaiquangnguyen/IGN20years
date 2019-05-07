### Khai Nguyen

# Interactions
This data visualization has the following interaction techniques:
+ Highlight and tooltip by hovering the mouse over the area of the stacked area charts
+ Tooltip by hovering the mouse over the bubble of the bubble chart
+ Clickable legend of the area charts to filter which data to show on the area charts and which data to highlight on the bubble chart

# Rationales
The dataset is a collection of many games reviewed by the website IGN.com over the last twenty years. The list does not contain all the game published during that time, however.

### Why stacked area chart?
For this dataset, I wanted to show how the games were reviewed overtime by genres and by platforms, so I constructed two areas chart for that purpose. The main rationale for this decision is that there are quite a lot of genres and platforms so stacked bar chart doesn't seem very valuable, while stacked area chart offers better readability. Furthermore, it is also much easier to see the trend overtime on a stacked area chart. Stacked line chart may also work in this case, but it is a little bit difficult to see the colors of the lines when ther are too many lines.


### Why bubble chart?
One of the things that I am really interested in this dataset is the relationship between the genres and the platforms. The most obivous relationship is the number of games that belong to a certain genre and a certain platforms, so I decided to created a bubble chart with the bubble size representing the number of games. Bubble charts are not always desireable, since the size of the bubble can be quite misleadning, but I find them useful for my purpose since I want to highlight the fact that there are certain genres and platforms with significantly more games than others. Another reason is that I am color-blind so I don't find using colors as useful, and using colors can be equally misleadning as well. 

### Why clickable legend?
I want users to be able to only focus on the genres or platforms that they are interested in, so I make the legend clickable so that they can select and filter which data they want to view. This is a risky decision, however, since a clickable legend is not as good of a signifier as checkboxes, so users may not immediately recognize that they can click on it. However, I think the tradeoff is worth it, since it makes the visualization cleaner and much easier to view. 

### Why tooltips and highlights
To give users who want to explore a specific genre or platform more information about that genre or platform. 

### Difficulties
+ The bubble chart is honestly quite difficult to design. I don't want it to be too misleadning, but I also find it too useful to just give up. Sizing the bubble is quite challenging as well, since I don't want the bubbles to overlap with each others. However, that also means that a lot of data will seem really trivial, since the bubbles will be significantly smaller.
+ Chosing the colors for the area chart is a real challenge. The main challenge is that there were too many categories, so it was virtually impossible to find a set of colors that are color-blind friendly, easy to diffierentiate, and are not misleading. The data is also not quantitative, so it also doesn't make a lot of senses to use gradient. Using rainbow color scheme is too misleadning.I also considered manually selecting the colors and assigning them to the graph using Munsell color system, but there were too many categories so it became quite hard. Also, I did not have enough time to do so. So what I did was to use D3.js built in interpolate function to create a series of colors to use. I think the result of this was quite good, so I decided to use it. Furthermore, I want to encourage the users to explore the data further than just looking at the area graphs. However, it is clear this color scheme has it problem when looking at the genres graph.   This is also why I make it so that it is much easier for users to explore the graphs further. 

### Other considerations
+ I considered brushing to select the years, and I spent quite a lot of time on it. However, in the end, I decided that it wasn't very useful, and replaced the brushing with the bubble chart. 
+ Finding a better color scheme is definitely deseriable

# Development process
I work alone for this project, so it wasn't a lot of teamwork. I think I spent roughly thirty hours of manpower on this project. The breakdown is roughly as follow:
+ 5 hours for data wrangling, including exploration and transformation
+ 2 hours of design. To decide on the data that I will use, the visualizations to use, and the interaction techniques
+ 8 hours of pure hell struggling with D3.js. Most of this time was spent trying to look at online examples and try to undertand why my code doesn't work
+ 15 hours of actual development where I made progress toward the final visualization

 The most definitive challenge was learning D3.js. I underestimated the learning curve of D3.js a bit, so I ended up spent quite some time just trying to learn it and it was somewhat scarier than I thought. However, once I get the gist of D3.js, it became much easier. A lot of time spent on development was to tidy up the code and the visualizations, which were somewhat tedious. 