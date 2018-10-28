import csv
import dedupe
from unidecode import unidecode
import os
import re

def preprocess(column):

    try:
        column = column.decode('utf8')
    except AttributeError:
        pass

    column = unidecode(column)
    column = re.sub(' +', ' ', column)
    column = re.sub('\n', ' ', column)
    column = column.strip().strip('"').strip("'").lower().strip()

    if not column:
        column = None
    return column

def read_data(filename):

    data_d = {}
    with open(filename) as f:
        reader = csv.DictReader(f)
        for row in reader:
            clean_row = [(k, preprocess(v)) for (k,v) in row.items()]
            row_id = int(row['Id'])
            data_d[row_id] = dict(clean_row)

    return data_d


def train_dedupe(fields, input_file = None, settings_file = None, training_file = None):

    print('importing data...')
    data_d = read_data(input_file)
    print(data_d)

    ### Loading settings file is exists else labeling, training on sample data and creating new settings file
    if os.path.exists(settings_file):
        print('reading from', settings_file)
        with open(settings_file, 'rb') as f:
            deduper = dedupe.StaticDedupe(f)
    else:

        fields = fields

        deduper = dedupe.Dedupe(fields)
        deduper.sample(data_d, 20)

        if os.path.exists(training_file):
            print('reading labeled examples from ', training_file)
            with open(training_file, 'rb') as f:
                deduper.readTraining(f)

        print('starting active labeling...')

        dedupe.consoleLabel(deduper)

        deduper.train()

        with open(training_file, 'w') as tf:
            deduper.writeTraining(tf)

        with open(settings_file, 'wb') as sf:
            deduper.writeSettings(sf)

def create_clusters_FF(input_file = None, output_file = None, settings_file = None):

    if os.path.exists(settings_file):
        print('reading from', settings_file)
        with open(settings_file, 'rb') as f:
            deduper = dedupe.StaticDedupe(f)

    print('importing data...')
    data_d = read_data(input_file)

    ### Creating a scoring threshold then clustering data based on threshold
    threshold = deduper.threshold(data_d, recall_weight=1)

    print('clustering...')
    clustered_dupes = deduper.match(data_d, threshold)

    print('# duplicate sets', len(clustered_dupes))

    cluster_membership = {}
    cluster_id = 0
    for (cluster_id, cluster) in enumerate(clustered_dupes):
        id_set, scores = cluster
        cluster_d = [data_d[c] for c in id_set]
        canonical_rep = dedupe.canonicalize(cluster_d)
        for record_id, score in zip(id_set, scores):
            cluster_membership[record_id] = {
                "cluster id" : cluster_id,
                "canonical representation" : canonical_rep,
                "confidence": score
            }

    ### Writing output file with rows from input file and with new columns of canonical data
    singleton_id = cluster_id + 1

    with open(output_file, 'w') as f_output, open(input_file) as f_input:
        writer = csv.writer(f_output)
        reader = csv.reader(f_input)

        heading_row = next(reader)
        heading_row.insert(0, 'confidence_score')
        heading_row.insert(0, 'Cluster ID')
        canonical_keys = canonical_rep.keys()
        for key in canonical_keys:
            heading_row.append('canonical_' + key)

        writer.writerow(heading_row)

        for row in reader:
            row_id = int(row[0])
            print(row_id)
            if row_id in cluster_membership:
                cluster_id = cluster_membership[row_id]["cluster id"]
                canonical_rep = cluster_membership[row_id]["canonical representation"]
                row.insert(0, cluster_membership[row_id]['confidence'])
                row.insert(0, cluster_id)
                for key in canonical_keys:
                    row.append(canonical_rep[key].encode('utf8'))
            else:
                row.insert(0, None)
                row.insert(0, singleton_id)
                singleton_id += 1
                for key in canonical_keys:
                    row.append(None)
            writer.writerow(row)

def create_clusters_DB(data_d, settings_file = None):

    if os.path.exists(settings_file):
        print('reading from', settings_file)
        with open(settings_file, 'rb') as f:
            deduper = dedupe.StaticDedupe(f)

    ### Creating a scoring threshold then clustering data based on threshold
    threshold = deduper.threshold(data_d, recall_weight=1)

    print('clustering...')
    clustered_dupes = deduper.match(data_d, threshold)

    print('# duplicate sets', len(clustered_dupes))

    cluster_membership = []
    cluster_id = 0
    for (cluster_id, cluster) in enumerate(clustered_dupes):
        id_set, scores = cluster
        cluster_d = [data_d[c] for c in id_set]
        canonical_rep = dedupe.canonicalize(cluster_d)

        cluster_record = {
            'cluster_id': cluster_id,
            'canonical representation': canonical_rep,
            'records': []
        }

        for record_id, score in zip(id_set, scores):
            cluster_record['records'].append({
                'record_id': record_id,
                'confidence': score
            })

        cluster_membership.append(cluster_record)

    print(cluster_membership)
    return cluster_membership


if __name__ == "__main__":

    # input_file = './data/csv_example_messy_input.csv'
    # output_file = './data/csv_example_output.csv'
    # settings_file = 'csv_example_learned_settings'
    # training_file = './data/csv_example_training.json'

    input_file = './data/dedupe.csv'
    output_file = './data/dedupe_output.csv'
    settings_file = 'dedupe_settings'
    training_file = './data/dedupe_training.json'

    # fields = [
    #     {'field': 'Site name', 'type': 'String'},
    #     {'field': 'Address', 'type': 'String'},
    #     {'field': 'Zip', 'type': 'Exact', 'has missing': True},
    #     {'field': 'Phone', 'type': 'String', 'has missing': True}
    # ]

    # fields = [
    #     {'field': 'invoice_number', 'type': 'Exact'},
    #     {'field': 'invoice_net_amount', 'type': 'Price', 'has missing': True},
    #     {'field': 'invoice_gross_amount', 'type': 'Price', 'has missing': True},
    #     {'field': 'vendor_number', 'type': 'Exact', 'has missing': True},
    #     {'field': 'vendor_invoice_number', 'type': 'Exact', 'has missing': True},
    #     {'field': 'po_flag', 'type': 'String'},
    #     {'field': 'po_number', 'type': 'Exact'},
    #     {'field': 'match_type', 'type': 'String'},
    #     {'field': 'invoice_date', 'type': 'DateTime'},
    #     {'field': 'invoice_due_date', 'type': 'DateTime'},
    #     {'field': 'invoice_paid_date', 'type': 'DateTime'},
    #     {'field': 'vendor_payment_terms', 'type': 'Text', 'has missing': True},
    #     {'field': 'invoice_status', 'type': 'String', 'has missing': True},
    #     {'field': 'invoice_type', 'type': 'String', 'has missing': True},
    #     {'field': 'gl_account', 'type': 'Exact', 'has missing': True},
    #     {'field': 'company', 'type': 'Name'},
    #     {'field': 'business_unit', 'type': 'String', 'has missing': True},
    #     {'field': 'currency_code', 'type': 'String'},
    #     {'field': 'source', 'type': 'Text'},
    # ]

    fields = [
        {'field': 'invoice_number', 'type': 'Exact'},
        {'field': 'invoice_net_amount', 'type': 'String', 'has missing': True},
        # {'field': 'invoice_gross_amount', 'type': 'Price', 'has missing': True},
        # {'field': 'vendor_number', 'type': 'Exact', 'has missing': True},
        # {'field': 'vendor_invoice_number', 'type': 'Exact', 'has missing': True},
        # {'field': 'po_flag', 'type': 'String'},
        # {'field': 'po_number', 'type': 'Exact'},
        # {'field': 'match_type', 'type': 'String'},
        # {'field': 'invoice_date', 'type': 'DateTime'},
        # {'field': 'invoice_due_date', 'type': 'DateTime'},
        # {'field': 'invoice_paid_date', 'type': 'DateTime'},
        # {'field': 'vendor_payment_terms', 'type': 'Text', 'has missing': True},
        # {'field': 'invoice_status', 'type': 'String', 'has missing': True},
        # {'field': 'invoice_type', 'type': 'String', 'has missing': True},
        # {'field': 'gl_account', 'type': 'Exact', 'has missing': True},
        # {'field': 'company', 'type': 'Name'},
        # {'field': 'business_unit', 'type': 'String', 'has missing': True},
        # {'field': 'currency_code', 'type': 'String'},
        {'field': 'source', 'type': 'Text'}
    ]

    # invoice_number	invoice_net_amount	invoice_gross_amount	invoice_shipping_cost	invoice_insurance_charge	invoice_discounts	invoice_tax	invoice_other_charge	vendor_number	vendor_invoice_number	po_flag	po_number	match_type	invoice_date	invoice_due_date	invoice_paid_date	vendor_payment_terms	invoice_status	invoice_type	gl_account	company	business_unit	currency_code	source

    # train_dedupe(fields, input_file, settings_file, training_file)

    # create_clusters_FF(input_file, output_file, settings_file)
    data_d = read_data(input_file)
    create_clusters_DB(data_d, settings_file)
