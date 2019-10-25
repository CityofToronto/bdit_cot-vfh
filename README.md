# bdit_cot-vfh
Visualization page for VFH to be used in the COT website.

## Build instructions
From [COT documentation](https://itdconfluence.csd.toronto.ca/display/DTSKS/CotJS+Documentation).  

### 1. Clone corejs to your local machine:  

`cd /path_to/some_working_directory && git clone https://github.com/CityofToronto/corejs.git`  

Go into the new corejs directory and install the core npm packages:  

`cd corejs && npm install`  

### 2. Update node packages
Open your terminal and go into your local copy of corejs:  

`cd /path_to/where_you_keep_/corejs`  

Switch to the `master` branch, pull the latest changes, and update the node packages:  

`git checkout master && git pull && npm update`  

### 3. Scaffold a new embedded or standalone project  
While in the corejs directory, scaffold a new embedded or standalone project:  

Embedded app: `gulp scaffold -dir ../name_of_new_app --bare --embedded`  

Standalone app: `gulp scaffold -dir ../name_of_new_app --bare --standalone`  

This app is **standalone**.  

### 4. Install the node and bower packages from project directory:

`cd ../name_of_new_app && npm install`  

### 5. Build and run
At this point, you should be able to use gulp tasks to build and run your project:

`gulp run`  


## Setup COT_UI
Needed for COT widgets (e.g. maps, charts).  

```
cd ./your-project-path
npm install https://github.com/CityofToronto/COT_UI.git#develop
npm install cotui --save
```

## Map setup
From [COT documentation](https://itdconfluence.csd.toronto.ca/display/DTSKS/Cot+Map). Uses function `cot_map` in `cot_map.js` that gets built into `main.js` with `gulp`.  

Function `cot_map` seems to be an updated version of the map in the [COTUI widgets page](https://github.com/CityofToronto/COT_UI). See the Examples [here](http://cityoftoronto.github.io/COT_UI).  

To get the map working (whichever version you use), add the following to `app.html`:  
```
<script type="text/javascript" src="<!-- @echo SRC_PATH -->/lib/cotui.js"></script>
<!-- Load Esri Leaflet from CDN https://github.com/Esri/esri-leaflet/issues/1113 -->
<script src="https://unpkg.com/esri-leaflet@2.0.7"></script>
```
