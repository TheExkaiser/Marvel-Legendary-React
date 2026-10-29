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
    id: 'core-set-complete',
    name: 'Core Set — Complete Set',
    schemeIds: ['coreset_cosmic_cube', 'coreset_legacy_virus', 'coreset_midtown_bank_robbery', 'coreset_negative_zone_prison_breakout', 'coreset_portals_to_the_dark_dimension', 'coreset_replace_earths_leaders_with_killbots', 'coreset_secret_invasion_of_the_skrull_shapeshifters'],
    mastermindIds: ['mastermind-drdoom', 'mastermind-loki', 'mastermind-magneto', 'mastermind-redskull'],
    heroPoolIds: ['coreset_black_widow', 'coreset_captain_america', 'coreset_cyclops', 'coreset_deadpool', 'coreset_emma_frost', 'coreset_gambit', 'coreset_hawkeye', 'coreset_hulk', 'coreset_iron_man', 'coreset_nick_fury', 'coreset_rogue', 'coreset_spider_man', 'coreset_storm', 'coreset_thor', 'coreset_wolverine'],
    villainGroupIds: ['coreset_brotherhood', 'coreset_enemies_of_asgard', 'coreset_hydra', 'coreset_masters_of_evil', 'coreset_radiation', 'coreset_skrulls', 'coreset_spider_foes'],
    henchmenGroupIds: ['coreset_doombot_legion', 'coreset_hand_ninjas', 'coreset_savage_land_mutates', 'coreset_sentinel'],
  },
  {
    id: 'dark-city-complete',
    name: 'Dark City — Complete Set',
    schemeIds: ['darkcity_massive_earthquake_generator', 'darkcity_organized_crime_wave', 'darkcity_transform_citizens_into_demons', 'darkcity_steal_the_weaponized_plutonium', 'darkcity_capture_baby_hope', 'darkcity_x_cutioners_song', 'darkcity_save_humanity', 'darkcity_detonate_the_helicarrier'],
    mastermindIds: ['mastermind-apocalypse', 'mastermind-kingpin', 'mastermind-mephisto', 'mastermind-mr-sinister', 'mastermind-stryfe'],
    heroPoolIds: ['darkcity_angel', 'darkcity_bishop', 'darkcity_blade', 'darkcity_cable', 'darkcity_colossus', 'darkcity_daredevil', 'darkcity_domino', 'darkcity_elektra', 'darkcity_forge', 'darkcity_ghost_rider', 'darkcity_iceman', 'darkcity_iron_fist', 'darkcity_jean_grey', 'darkcity_nightcrawler', 'darkcity_professor_x', 'darkcity_punisher', 'darkcity_wolverine'],
    villainGroupIds: ['darkcity_emissaries_of_evil', 'darkcity_four_horsemen', 'darkcity_marauders', 'darkcity_mlf', 'darkcity_streets_of_new_york', 'darkcity_underworld'],
    henchmenGroupIds: ['darkcity_maggia_goons', 'darkcity_phalanx'],
  },
  {
    id: 'fantastic-four-complete',
    name: 'Fantastic Four — Complete Set',
    schemeIds: ['fantasticfour_bathe_the_earth_in_cosmic_rays', 'fantasticfour_flood_the_planet_with_melted_glaciers', 'fantasticfour_invincible_force_field', 'fantasticfour_pull_reality_into_the_negative_zone'],
    mastermindIds: ['mastermind-galactus', 'mastermind-mole-man'],
    heroPoolIds: ['fantasticfour_human_torch', 'fantasticfour_invisible_woman', 'fantasticfour_mr_fantastic', 'fantasticfour_silver_surfer', 'fantasticfour_thing'],
    villainGroupIds: ['fantasticfour_heralds_of_galactus', 'fantasticfour_subterranea'],
    henchmenGroupIds: [],
  },
  {
    id: 'paint-the-town-red-complete',
    name: 'Paint the Town Red — Complete Set',
    schemeIds: [],
    mastermindIds: [],
    heroPoolIds: ['paint_red_black_cat', 'paint_red_moon_knight', 'paint_red_scarlet_spider', 'paint_red_spider_woman', 'paint_red_symbiote_spider_man'],
    villainGroupIds: ['paint_red_maximum_carnage', 'paint_red_sinister_six'],
    henchmenGroupIds: [],
  },
  {
    id: 'guardians-of-the-galaxy-complete',
    name: 'Guardians of the Galaxy — Complete Set',
    schemeIds: ['gotg_forge_the_infinity_gauntlet', 'gotg_the_kree_skrull_war', 'gotg_intergalactic_kree_nega_bomb', 'gotg_unite_the_shards'],
    mastermindIds: ['mastermind-supreme-intelligence-of-the-kree', 'mastermind-thanos'],
    heroPoolIds: ['gotg_drax_the_destroyer', 'gotg_gamora', 'gotg_groot', 'gotg_rocket_raccoon', 'gotg_star_lord'],
    villainGroupIds: ['gotg_kree_starforce', 'gotg_infinity_gems'],
    henchmenGroupIds: [],
  },
]
