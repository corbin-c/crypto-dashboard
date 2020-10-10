let graph = {
  data: function() {
    return {
      updateNeeded: true,
      granularity: this.$root.realGranularity.value,
      data: {
          "sets": [
            [
              {"x":1,"y":1},
              {"x":2,"y":1},
              {"x":3,"y":1},
              {"x":4,"y":1},
              {"x":5,"y":1}
            ]
          ]}
    }
  },
  created() {
    this.$root.$on("fetched",this.fetch);
    this.$root.$on("updatedGranularity",this.updGrn);
    this.checkData();
  },
  components: {
  },
  methods: {
    updGrn(value) {
      this.granularity = value;
      this.checkData();
    },
    fetch(results) {
      if (results[0] == this.currencyname) {
        this.handleData(results[1]);
      }
    },
    getValues() {
      return this.$root.getStore("currencies").find(e => e.name == this.currencyname);
    },
    getData() {
      this.$root.$emit("setFetch",[this.currencyname,this.granularity]);
    },
    handleData(results) {
      /*let results = await fetch("https://api.pro.coinbase.com/products/"+this.currencyname+"/candles?granularity="+this.granularity);
      results = await results.json();*/
      let output = { "sets": [[]] };
      results.map(e => {
        output.sets[0].push({"x":e[0]*1000,"y":(e[1]+e[2])/2});
      });
      this.data = output;
      let currencies = this.$root.currencies;
      let gran = currencies.find(e => e.name == this.currencyname).sets.find(e => e.granularity == this.granularity);
      if (typeof gran !== "undefined") {
        gran.data = output;
        gran.lastUpd = (new Date()).valueOf();
      } else {
        currencies.find(e => e.name == this.currencyname).sets.push({
          granularity: this.granularity,
          data: output,
          lastUpd: (new Date()).valueOf()
        });
      }
      this.updateNeeded = false;
      this.$root.currencies = currencies;
      this.$root.putStore("currencies",currencies);
    },
    async checkData() {
      let values = this.getValues();
      if (typeof values !== "undefined") {
        values = values.sets.find(e => e.granularity == this.granularity);
      }
      if ((typeof values === "undefined") || (values.data === false)) {
        this.updateNeeded = true;
        this.getData();
      } else if (values.lastUpd+this.granularity*1000 < (new Date()).valueOf()) {
        this.data = values.data;
        this.updateNeeded = true;
        this.getData();
      } else  {
        this.updateNeeded = false;
        this.data = values.data;
      }
    },
    removeCurrency() {
      this.$root.$emit("removeCurrency",this.currencyname);
    }
  },
  computed: {
    json() {
      return JSON.stringify(this.data);
    },
    getColor() {
      return [
        "#4e79a7",
        "#f28e2c",
        "#e15759",
        "#76b7b2",
        "#59a14f",
        "#edc949",
        "#af7aa1",
        "#ff9da7",
        "#9c755f",
        "#00bed1"
      ][this.color%10];
    }
  },
  props: ["currencyname","color"],
  template: `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="graph-container rounded border-bottom border-top border-left border-right m-1">
        <d3-curves
          line="static"
          v-bind:caption="currencyname"
          ticks-y="3"
          ticks-x="0"
          v-bind:color="getColor"
          v-bind:json="json">
        </d3-curves>
        <div v-if="updateNeeded" class="updateNeeded">
          <div class="spinner-border text-danger mx-auto" style="width: 4rem; height: 4rem;"></div>
        </div>
        <div class="trash">
          <button class="btn btn-outline-danger" v-on:click="removeCurrency">
            <svg>
              <use xlink:href="../octicons-sprite/octicons-sprite.svg#trash-24"></use>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
};
export { graph }
//<d3-curves line="static" v-bind:caption="currKey" ticks-y="3" ticks-x="0" v-bind:json="data"></d3-curves>
