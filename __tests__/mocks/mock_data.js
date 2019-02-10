const simpleFauxDependencyTree = {
  // want this to go to:
  /*
    potatoes=baked,
    pumpkin_pie=moms-recipe,
    kids_table,
    cake=chocolate
    holiday_dinner
  */
  dependencies: {
    name: 'holiday_dinner',
    kids_table: {
      requires: {
        pumpkin_pie: 'moms-recipe',
        potatoes: 'baked'
      }
    },
    pumpkin_pie: {
      version: 'moms-recipe'
    },
    potatoes: {
      version: 'baked'
    },
    cake: {
      version: 'chocolate'
    }
  }
};

const middleTree = {
  /*
    potatoes=baked,
    pumpkin_pie=brothers-recipe,
    kids_table,
    cake=chocolate,
    pumpkin_pie=moms-recipe,
    holiday_dinner
  */
  dependencies: {
    name: 'holiday_dinner',
    kids_table: {
      requires: {
        pumpkin_pie: 'brothers-recipe',
        potatoes: 'baked'
      },
      dependencies: {
        pumpkin_pie: 'brothers-recipe'
      }
    },
    pumpkin_pie: {
      version: 'moms-recipe'
    },
    potatoes: {
      version: 'baked'
    },
    cake: {
      version: 'chocolate'
    }
  }
};

const totalFauxDependencyTree = {
  /*
    pumpkin_pie=brothers-recipe
    potatoes=baked
    party_hats=festive
    kids_table

    elastic=white
    party_hats

    potatoes=mashed
    big_kids_table

    pumpkin_pie=moms
    potatoes=baked
    cake=chocolate
    holiday_dinner
  */
  name: 'holiday_dinner',
  dependencies: {
    pumpkin_pie: {
      version: 'moms-recipe'
    },
    potatoes: {
      version: 'baked'
    },
    cake: {
      version: 'chocolate'
    },
    kids_table: {
      requires: {
        pumpkin_pie: 'brothers-recipe',
        potatoes: 'baked',
        party_hats: 'festive'
      },
      dependencies: {
        pumpkin_pie: 'brothers-recipe'
      }
    },
    big_kids_table: {
      dependencies: {
        potatoes: {
          version: 'mashed'
        }
      }
    },
    party_hats: {
      version: 'festive',
      requires: {
        elastic: 'white'
      }
    }
  }
};

module.exports = {
  simpleFauxDependencyTree: simpleFauxDependencyTree
}
