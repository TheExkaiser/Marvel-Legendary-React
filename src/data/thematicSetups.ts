export interface ThematicSetup {
  id: string
  name: string
  schemeIds: string[]
  mastermindIds: string[]
  heroPoolIds: string[]
  villainGroupIds: string[]
  henchmenGroupIds: string[]
}

/**
 * Thematic presets intentionally contain pools, not fixed final selections.
 * The setup rules decide how many entries are needed and missing entries fall
 * back to the currently enabled sets.
 */
export const THEMATIC_SETUPS: ThematicSetup[] = [
  {
    id: 'avengers-assemble',
    name: 'Avengers Assemble',
    schemeIds: [
      'coreset_midtown_bank_robbery',
      'coreset_cosmic_cube',
      'coreset_legacy_virus',
    ],
    mastermindIds: ['mastermind-redskull', 'mastermind-drdoom', 'mastermind-loki'],
    heroPoolIds: [
      'coreset_black_widow',
      'coreset_captain_america',
      'coreset_hawkeye',
      'coreset_hulk',
      'coreset_iron_man',
      'coreset_spider_man',
      'coreset_thor',
    ],
    villainGroupIds: ['coreset_hydra', 'coreset_masters_of_evil', 'coreset_spider_foes'],
    henchmenGroupIds: ['coreset_doombot_legion', 'coreset_hand_ninjas', 'coreset_sentinel'],
  },
  {
    id: 'dark-city-underworld',
    name: 'Dark City: Underworld',
    schemeIds: ['darkcity_organized_crime_wave', 'darkcity_massive_earthquake_generator', 'darkcity_save_humanity'],
    mastermindIds: ['mastermind-kingpin', 'mastermind-apocalypse'],
    heroPoolIds: ['darkcity_daredevil', 'darkcity_punisher', 'darkcity_blade', 'darkcity_iron_fist', 'darkcity_ghost_rider', 'darkcity_wolverine'],
    villainGroupIds: ['darkcity_underworld', 'darkcity_marauders', 'darkcity_streets_of_new_york'],
    henchmenGroupIds: ['darkcity_maggia_goons', 'darkcity_phalanx'],
  },
  {
    id: 'cosmic-crisis',
    name: 'Fantastic Four: Cosmic Crisis',
    schemeIds: [
      'fantasticfour_bathe_the_earth_in_cosmic_rays',
      'fantasticfour_flood_the_planet_with_melted_glaciers',
      'fantasticfour_invincible_force_field',
      'fantasticfour_pull_reality_into_the_negative_zone',
    ],
    mastermindIds: ['mastermind-galactus', 'mastermind-mole-man'],
    heroPoolIds: [
      'fantasticfour_human_torch',
      'fantasticfour_invisible_woman',
      'fantasticfour_mr_fantastic',
      'fantasticfour_silver_surfer',
      'fantasticfour_thing',
    ],
    villainGroupIds: ['fantasticfour_heralds_of_galactus', 'fantasticfour_subterranea'],
    henchmenGroupIds: [],
  },
]
