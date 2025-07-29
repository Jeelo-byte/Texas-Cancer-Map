// Utility script to assign county IDs to environmental sites
// Run this in the browser console on the admin page

const countyMapping = {
  "Harris": "18eeec4c-e14e-4bd7-97ae-4542abea7dbb",
  "Brazoria": "0459e592-f16c-446b-8a71-27d8660e80ce",
  "Galveston": "bf359cce-6944-4ab0-8100-ae746e77bc84",
  "Jefferson": "920c5d74-9647-4111-848d-245867d46461",
  "Orange": "40b9fcf0-332a-49cb-b5cb-4aaac8222b59",
  "Chambers": "2e94ea4f-bf9d-4057-9467-8d6835737e21",
  "Liberty": "b4ed6e14-528a-463e-ab35-b1ed9b9e98c7",
  "Montgomery": "a486a079-1398-483e-b2f6-3d1f206dbb78",
  "Fort Bend": "4fa3b25a-c969-496e-ad4a-9d6be077e5c4",
  "Waller": "e36ff822-4c39-43bf-a875-c33a07da5a65",
  "Austin": "6eab6923-6eea-40ff-b239-25139b725f6d",
  "Colorado": "f372d944-6fce-4a0d-920b-a8e19fe7c83b",
  "Fayette": "7fd2bfff-9153-4db8-8d92-bdc5ffa9b3c4",
  "Washington": "02716507-15fe-47c2-b738-c0410606f70f",
  "Lee": "a6b62c9b-7c85-4570-b852-7618df8020b0",
  "Bastrop": "c4a18854-bd4f-4a88-ac4e-e521ca454a15",
  "Caldwell": "f7ec45fc-e51c-42c6-9851-c4fee27d3eef",
  "Hays": "50e94eb9-4db1-4b3c-ae3b-5c7f642bf0a4",
  "Travis": "2d7ef1ed-0933-4fbe-aa30-498e242b2ed5",
  "Williamson": "ddf13cc2-e94d-4b94-8b3c-580e5a0b9bd0",
  "Bell": "e12f4a83-9e44-4d70-a307-001b50e13346",
  "Milam": "39f647f6-c622-44fb-a7b8-105e5bfdd8c5",
  "Robertson": "cd46c297-0fb6-4e44-b32d-c6960117cce4",
  "Leon": "66ed2c22-6e86-48f1-b6f8-a91cd3600700",
  "Madison": "db934ba5-2896-4da9-9b50-6e5e7e0e72b5",
  "Walker": "9c9b9e8b-deb1-4a88-be0c-8c91770fcac7",
  "Grimes": "d2e07844-829d-4726-ab98-f1fe51ac9c06",
  "Brazos": "fee10077-d43f-4065-8e82-0b6f3350b1ed",
  "Burleson": "ab574d34-d257-4b58-89c4-6d13649349f3",
  "San Jacinto": "f62272b1-c721-4329-b06e-d217133798fe",
  "Polk": "6391e609-2c47-4a78-a3bc-9d7a00572157",
  "Trinity": "6f564162-d9c5-4058-914a-4c0ccad2096e",
  "Houston": "d7081bdb-66de-4e40-a9e7-14666e6e8656",
  "Anderson": "95bbde25-76a0-458e-9d59-5453ca08f03d",
  "Cherokee": "2c631f24-40a7-42f1-a51d-a3d92843d2c2",
  "Nacogdoches": "079dc436-e067-4661-ab2c-702272f95685",
  "Angelina": "51bcc81a-1879-4027-8005-c92d687722b5",
  "San Augustine": "b3d8c84c-7372-47f1-b339-d18c77fbdacc",
  "Shelby": "fa89157a-0e5e-4648-8979-0a8f8057ddca",
  "Panola": "68590f7d-f621-465a-af74-e4a154a18dd4",
  "Rusk": "f0414c33-d75d-4764-80cb-0ab440c0f5d2",
  "Smith": "0aadb53a-3b0f-4fa6-983f-61bd3a3bcd27",
  "Gregg": "40356925-b278-4c0d-8fab-8663f7249ba7",
  "Upshur": "da41eef2-287c-4455-bcdd-05483b0436a3",
  "Harrison": "6fbb2505-8624-47b3-b9b6-5365796badab",
  "Marion": "7e7791ef-de87-4925-b2c2-eed6d2116362",
  "Cass": "a36752ac-dfc4-4341-b87f-d5b9932355a9",
  "Morris": "6ba79941-8346-4d92-8b5c-184354c87218",
  "Titus": "113d1ab3-2d63-4bac-87a1-95fc7a0bf3eb",
  "Franklin": "46fae6cd-c2d8-412f-b466-12f799f4ab90",
  "Camp": "a8ef55b5-f115-4f68-9ab8-ba406d569594",
  "Wood": "598ce5ae-dfd1-4eb2-a735-4fd6b8fccf18",
  "Van Zandt": "cc646508-e34c-40a8-9fbb-1fef8b2a7931",
  "Henderson": "09b42efe-7164-41e2-8d47-d6dbfd53095a",
  "Kaufman": "267e51d6-474b-46e5-bdd2-0d92c3462b80",
  "Dallas": "f87d96fc-d59f-4bff-ad6a-71cf2f24233e",
  "Collin": "0a3a300e-74af-4871-918f-91a33c02405f",
  "Denton": "7067f89d-52ad-445d-ae5a-8a3e6459fce1",
  "Tarrant": "bdc60450-3d69-4181-80af-df779456e031",
  "Johnson": "73c66454-17a6-4b12-9852-b45517f3ae0b",
  "Ellis": "0bee1e4b-67ab-4297-8e00-e183fdc96ec5",
  "Parker": "d4b5634c-1c0f-4b89-bb67-b374d3153824",
  "Wise": "7f144dec-0f4f-4698-9d27-914e59a6816d",
  "Hood": "46c477c6-1aa3-4e2d-be81-3dda07377ffc",
  "Somervell": "7e742c7b-7eeb-449d-bc6f-c053f2ef0205",
  "Hill": "d8d81214-49bd-4113-89f9-d19def06274b",
  "Bosque": "52bbf74d-5877-4063-a6ac-bb80aef0d1d7",
  "McLennan": "66bec94c-dd37-4663-9005-7182e2e5def8",
  "Limestone": "19461683-5172-4bb2-9b25-9b7baef6c6a7",
  "Navarro": "bcf1d75d-75b4-4452-9eb2-55ab5a8c14f3",
  "Falls": "8113e868-3a8f-46cd-b88e-62097b0c7a67",
  "Lampasas": "cf795da3-1cd4-4ad3-91d3-064cca7514fc",
  "Burnet": "3e3dfbad-cbb6-4303-a52d-7f85b553f606",
  "Llano": "43973d7e-2a85-47ac-ac88-e203a462fb4a",
  "Gillespie": "934cd21f-cad6-4fd4-8c3a-0bbadd0b578e",
  "Kendall": "89ac39a6-59f2-4eca-96bb-c0196f3173a8",
  "Bexar": "1d62f77f-a393-484c-9ad5-da8be28146c3",
  "Comal": "89e07865-eec6-4757-9cf2-64d2ce640ac0",
  "Guadalupe": "c0190d9c-8d80-4f7e-8e21-1d678f60d0e2",
  "Wilson": "8bcbd960-730a-4de2-919f-75d5e234f0f0",
  "Karnes": "277931b2-816f-4db9-952e-ca61a6314e34",
  "Gonzales": "37cb5f61-1a1f-4d6b-b994-7570a20e0d9a",
  "De Witt": "27b95a52-d109-4ba8-893b-324a6805729b",
  "Lavaca": "dae824f6-d682-4193-9961-0d6ab0d8f24b",
  "Fayette": "7fd2bfff-9153-4db8-8d92-bdc5ffa9b3c4",
  "Colorado": "f372d944-6fce-4a0d-920b-a8e19fe7c83b",
  "Austin": "6eab6923-6eea-40ff-b239-25139b725f6d",
  "Fort Bend": "4fa3b25a-c969-496e-ad4a-9d6be077e5c4",
  "Waller": "e36ff822-4c39-43bf-a875-c33a07da5a65",
  "Harris": "18eeec4c-e14e-4bd7-97ae-4542abea7dbb"
};

// Function to assign county IDs to sites
async function assignCountyIds() {
  try {
    // Get the Supabase client from the window object (if available)
    const supabase = window.supabase;
    if (!supabase) {
      console.error("Supabase client not found. Make sure you're on the admin page.");
      return;
    }

    // Fetch all sites without county_id
    const { data: sitesWithoutCounty, error: sitesError } = await supabase
      .from("environmental_sites")
      .select("*")
      .is("county_id", null);
    
    if (sitesError) {
      console.error("Error fetching sites without county:", sitesError);
      return;
    }

    if (!sitesWithoutCounty || sitesWithoutCounty.length === 0) {
      console.log("No sites found without county assignment");
      return;
    }

    console.log(`Found ${sitesWithoutCounty.length} sites without county assignment`);

    let updatedCount = 0;
    for (const site of sitesWithoutCounty) {
      // Try to find county based on city name or site location
      let assignedCountyId = null;
      
      // Check if the site is in Harris County (based on your data)
      if (site.city && site.city.toLowerCase().includes('channelview')) {
        assignedCountyId = countyMapping["Harris"];
      }
      
      // Add more specific mappings based on your data
      if (site.site_name && site.site_name.toLowerCase().includes('k-solv')) {
        assignedCountyId = countyMapping["Harris"];
      }

      if (assignedCountyId) {
        // Update the site with the county ID
        const { error: updateError } = await supabase
          .from("environmental_sites")
          .update({ county_id: assignedCountyId })
          .eq("id", site.id);
        
        if (updateError) {
          console.error(`Error updating site ${site.site_name}:`, updateError);
        } else {
          updatedCount++;
          console.log(`Assigned site ${site.site_name} to Harris County`);
        }
      } else {
        console.log(`Could not determine county for site: ${site.site_name} in ${site.city}`);
      }
    }

    console.log(`Successfully assigned ${updatedCount} sites to counties`);
    
  } catch (error) {
    console.error("Error in assignCountyIds:", error);
  }
}

// Function to manually assign a specific site to a county
async function assignSiteToCounty(siteId, countyName) {
  try {
    const supabase = window.supabase;
    if (!supabase) {
      console.error("Supabase client not found");
      return false;
    }

    const countyId = countyMapping[countyName];
    if (!countyId) {
      console.error(`County "${countyName}" not found in mapping`);
      return false;
    }

    const { error } = await supabase
      .from("environmental_sites")
      .update({ county_id: countyId })
      .eq("id", siteId);
    
    if (error) {
      console.error("Error assigning site to county:", error);
      return false;
    } else {
      console.log(`Successfully assigned site ${siteId} to ${countyName}`);
      return true;
    }
  } catch (error) {
    console.error("Error in assignSiteToCounty:", error);
    return false;
  }
}

// Make functions available globally
window.assignCountyIds = assignCountyIds;
window.assignSiteToCounty = assignSiteToCounty;
window.countyMapping = countyMapping;

console.log("County assignment utilities loaded. Use:");
console.log("- assignCountyIds() to automatically assign counties");
console.log("- assignSiteToCounty(siteId, countyName) to manually assign a site");
console.log("- countyMapping to see available counties"); 